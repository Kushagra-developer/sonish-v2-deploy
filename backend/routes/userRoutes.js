import express from 'express';
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

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/sync', protect, syncUserCartAndWishlist);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
