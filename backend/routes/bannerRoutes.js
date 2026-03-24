import express from 'express';
const router = express.Router();
import {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getBanners).post(protect, admin, createBanner);
router.route('/admin').get(protect, admin, getAdminBanners);
router.route('/:id').put(protect, admin, updateBanner).delete(protect, admin, deleteBanner);

export default router;
