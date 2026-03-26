import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';
import Product from '../models/productModel.js';

// @desc    Create a notification request
// @route   POST /api/notifications
// @access  Public
export const createNotificationRequest = asyncHandler(async (req, res) => {
  const { productId, email, size } = req.body;

  if (!productId || !email || !size) {
    res.status(400);
    throw new Error('Please provide product, email, and size');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  try {
    const notification = await Notification.create({
      product: productId,
      email,
      size
    });
    res.status(201).json(notification);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400);
      throw new Error('You are already signed up for a notification for this product and size');
    }
    throw err;
  }
});

// @desc    Get all notification requests (Admin)
// @route   GET /api/notifications
// @access  Private/Admin
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({})
    .populate('product', 'name countInStock')
    .sort({ createdAt: -1 });
    
  res.json(notifications);
});

// @desc    Update notification status (Admin)
// @route   PUT /api/notifications/:id
// @access  Private/Admin
export const updateNotificationStatus = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    notification.status = req.body.status || notification.status;
    const updated = await notification.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Notification request not found');
  }
});
