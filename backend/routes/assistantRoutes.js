import express from 'express';
import { processCommand } from '../controllers/assistantController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, admin, processCommand);

export default router;
