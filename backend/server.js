import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import razorpayRoutes from './routes/razorpayRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

// Helmet – sets various HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// CORS – strict origin whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'https://sonish-v2.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                       origin.endsWith('.vercel.app') || 
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
    optionsSuccessStatus: 200, // Important for some browser preflights
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser needed for JWT read
app.use(cookieParser());

// ──────────────────────────────────────────────
// Routes
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
