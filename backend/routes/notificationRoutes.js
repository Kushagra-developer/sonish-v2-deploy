import express from 'express';
import { 
  createNotificationRequest, 
  getNotifications, 
  updateNotificationStatus 
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getNotifications)
  .post(createNotificationRequest);

router.route('/:id')
  .put(protect, admin, updateNotificationStatus);

export default router;
