import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  syncUserCartAndWishlist,
  sendOtp,
  verifyOtp
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { message: 'Too many OTP requests from this IP, please try again after 5 minutes' },
});

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10, 
  message: { message: 'Too many verification attempts from this IP, please try again after 5 minutes' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many accounts created from this IP, please try again after an hour' },
});

router.post('/', registerLimiter, registerUser);
router.post('/login', loginLimiter, authUser);
router.post('/logout', logoutUser);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyLimiter, verifyOtp);
router.put('/sync', protect, syncUserCartAndWishlist);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
