import express from 'express';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getPublicCoupons,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route('/public').get(getPublicCoupons);
router.route('/validate').post(validateCoupon);
router.route('/:id').put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;
