import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import Notification from '../models/notificationModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

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
    const oldStatus = notification.status;
    notification.status = req.body.status || notification.status;
    const updated = await notification.save();

    // If marked as notified, send email to customer
    if (updated.status === 'notified' && oldStatus !== 'notified') {
      try {
        const product = await Product.findById(notification.product);
        let transporter;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
        } else {
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email', port: 587,
            auth: { user: testAccount.user, pass: testAccount.pass },
          });
        }

        await transporter.sendMail({
          from: `"Sonish Studios" <${process.env.EMAIL_USER || 'no-reply@sonish.co.in'}>`,
          to: notification.email,
          subject: `${product.name} is back in stock! ✨`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #eee; padding: 40px;">
              <h1 style="font-size: 28px; letter-spacing: 3px; margin-bottom: 4px; text-align: center;">SONISH</h1>
              <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 4px; margin-top: 0; text-align: center;">Modern Elegance</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <h2 style="font-size: 20px; color: #111; margin-bottom: 6px;">It's back!</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.8;">The item you were waiting for is now available in your size.</p>
              <div style="background: #f9f9f9; border: 1px solid #eee; padding: 20px 24px; margin: 24px 0;">
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Product</p>
                <p style="margin: 4px 0 16px; font-size: 18px; font-weight: bold; color: #111;">${product.name}</p>
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Size</p>
                <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #c9a84c;">${notification.size}</p>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.CORS_ORIGIN?.split(',')[0]}/product/${product._id}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-top: 24px;">Shop Now →</a>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="font-size: 12px; color: #aaa; text-align: center;">© Sonish Studios · Mumbai, India</p>
            </div>`
        });
      } catch (emailErr) {
        console.error('Customer restock email failed:', emailErr.message);
      }
    }

    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Notification request not found');
  }
});
