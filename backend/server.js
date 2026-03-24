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
import bannerRoutes from './routes/bannerRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: false, // Frontend handles its own CSP
}));

// CORS – allow Vercel frontend + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'https://sonish-v2.vercel.app',
  'https://sonish.co.in',
  'https://www.sonish.co.in',
];

app.use(
  cors({
    origin: (origin, callback) => {
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
    optionsSuccessStatus: 200,
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ──────────────────────────────────────────────
// Maintenance Mode Middleware
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const isAdminRoute = req.path.startsWith('/api/admin') || 
                       req.path.includes('admin') || 
                       req.path.includes('login') || 
                       req.path.includes('logout');

  if (isMaintenanceMode && !isAdminRoute && req.path !== '/api/health' && req.path !== '/') {
    return res.status(503).json({
      message: 'Sonish Studio is currently undergoing a curated update. We will be back shortly with more elegance.',
      maintenance: true
    });
  }
  next();
});

// ──────────────────────────────────────────────
// API Routes (Backend is API-ONLY)
// ──────────────────────────────────────────────

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/razorpay', razorpayRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Sonish API is running' });
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
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅  MongoDB connected'))
    .catch(err => console.error(err));
} else {
  console.warn('⚠️   MONGO_URI not set – skipping database connection');
}

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
}

export default app;
