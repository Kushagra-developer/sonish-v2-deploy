import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import razorpayRoutes from './routes/razorpayRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

// Helmet – relaxed CSP to allow Vite's module scripts and Razorpay
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://lumberjack-cx.razorpay.com", "https://*.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      objectSrc: ["'none'"],
    },
  },
}));

// CORS – strict origin whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'https://sonish-v2.vercel.app',
  'https://sonish.co.in',
  'http://sonish.co.in',
  'https://www.sonish.co.in',
  'http://www.sonish.co.in',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, same-origin)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                       origin.endsWith('.vercel.app') || 
                       origin.endsWith('.onrender.com') ||
                       origin.includes('localhost');
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser needed for JWT read
app.use(cookieParser());

// ──────────────────────────────────────────────
// Serve Static Frontend (BEFORE API routes so assets load correctly)
// ──────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────────
// SPA Fallback (AFTER API routes, BEFORE error handlers)
// ──────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running securely on Render....');
  });
}

// ──────────────────────────────────────────────
// Error handling middleware
// ──────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────────
// Database connection & server start
// ──────────────────────────────────────────────

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅  MongoDB connected')).catch(err => console.error(err));
} else {
  console.warn('⚠️   MONGO_URI not set – skipping database connection');
}

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
}

export default app;
