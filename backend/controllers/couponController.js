import asyncHandler from 'express-async-handler';
import Coupon from '../models/couponModel.js';

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountAmount, minPurchase, expiryDate, usageLimit } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountAmount,
    minPurchase,
    expiryDate,
    usageLimit,
  });

  res.status(201).json(coupon);
});

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = req.body.code || coupon.code;
    coupon.discountType = req.body.discountType || coupon.discountType;
    coupon.discountAmount = req.body.discountAmount ?? coupon.discountAmount;
    coupon.minPurchase = req.body.minPurchase ?? coupon.minPurchase;
    coupon.expiryDate = req.body.expiryDate ?? coupon.expiryDate;
    coupon.usageLimit = req.body.usageLimit ?? coupon.usageLimit;
    coupon.isActive = req.body.isActive ?? coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Validate/Apply a coupon (Public/Customer)
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or inactive coupon code');
  }

  // Check Expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    res.status(400);
    throw new Error('Coupon has expired');
  }

  // Check Usage Limit
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  // Check Min Purchase
  if (cartTotal < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon`);
  }

  // Calculate Discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * coupon.discountAmount) / 100;
  } else {
    discount = coupon.discountAmount;
  }

  // Ensure discount doesn't exceed total
  discount = Math.min(discount, cartTotal);

  res.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountAmount: coupon.discountAmount,
    discountValue: discount,
  });
});

export { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
