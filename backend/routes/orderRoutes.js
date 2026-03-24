import express from 'express';
import {
  getMyOrders,
  getOrders,
  updateOrderTracking,
  getOrderTracking,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/tracking').put(protect, admin, updateOrderTracking).get(protect, getOrderTracking);

export default router;
