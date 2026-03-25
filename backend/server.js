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
import categoryRoutes from './routes/categoryRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Runtime maintenance mode state (defaults to env var, toggleable via API)
let isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ──────────────────────────────────────────────
// Security middleware
// ──────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }, // Required for Razorpay payment popups
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
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
      const isAllowed = allowedOrigins.includes(origin);
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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ──────────────────────────────────────────────
// Maintenance Mode Middleware
// ──────────────────────────────────────────────
app.use((req, res, next) => {
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
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);

// Maintenance mode toggle API
import { protect, admin } from './middleware/authMiddleware.js';
app.get('/api/admin/maintenance', protect, admin, (_req, res) => {
  res.json({ maintenance: isMaintenanceMode });
});
app.put('/api/admin/maintenance', protect, admin, (req, res) => {
  isMaintenanceMode = !!req.body.maintenance;
  res.json({ maintenance: isMaintenanceMode, message: isMaintenanceMode ? 'Site is now OFFLINE' : 'Site is now ONLINE' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), maintenance: isMaintenanceMode });
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
