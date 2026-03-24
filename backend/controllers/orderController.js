import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    paymentResult,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product || x._id, // Handle both formats
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: isPaid || false,
      paidAt: paidAt || null,
      paymentResult: paymentResult || null,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    if (
      order.user._id.toString() === req.user._id.toString() ||
      req.user.isAdmin
    ) {
      res.json(order);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: 1 });
  res.json(orders);
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order tracking info
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
const updateOrderTracking = async (req, res) => {
  const { trackingNumber, carrier } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    const wasProcessing = order.trackingStatus === 'Processing';

    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.carrier = carrier || order.carrier;
    
    if (trackingNumber && wasProcessing) {
      order.trackingStatus = 'Shipped';
      order.isShipped = true;
      order.shippedAt = new Date();

      // Send shipping notification email to customer
      try {
        const customer = await User.findById(order.user).select('email name');
        if (customer?.email) {
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
            to: customer.email,
            subject: `Your order #${order._id.toString().slice(-8)} has been shipped! 🎉`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #eee; padding: 40px;">
                <h1 style="font-size: 28px; letter-spacing: 3px; margin-bottom: 4px;">SONISH</h1>
                <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 4px; margin-top: 0;">Modern Elegance</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <h2 style="font-size: 20px; color: #111; margin-bottom: 6px;">Your order is on its way!</h2>
                <p style="color: #555; font-size: 14px; line-height: 1.8;">Hi ${customer.name || 'there'},<br/>Great news! Your order has been dispatched and is heading your way.</p>
                <div style="background: #f9f9f9; border: 1px solid #eee; padding: 20px 24px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Order ID</p>
                  <p style="margin: 4px 0 16px; font-size: 16px; font-weight: bold; color: #111;">#${order._id.toString().slice(-8)}</p>
                  <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Tracking Number</p>
                  <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #c9a84c;">${trackingNumber}</p>
                </div>
                <a href="https://www.delhivery.com/track/package/${trackingNumber}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 24px;">Track Your Order →</a>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 12px; color: #aaa; text-align: center;">© Sonish Studios · Mumbai, India</p>
              </div>`,
          });
        }
      } catch (emailErr) {
        console.error('Shipping email failed:', emailErr.message);
        // Don't fail the request if email fails
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get order tracking info from Delhivery
// @route   GET /api/orders/:id/tracking
// @access  Private
const getOrderTracking = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.trackingNumber) {
    res.status(400);
    throw new Error('Order does not have a tracking number yet');
  }

  // Import the service dynamically or at the top. Moving it here for self-containment in this chunk
  const { fetchTrackingDetails } = await import('../services/delhiveryService.js');
  const trackingData = await fetchTrackingDetails(order.trackingNumber);

  res.json(trackingData);
};

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/shipped
// @access  Private/Admin
const updateOrderToShipped = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const wasShipped = order.isShipped;
    order.isShipped = true;
    order.shippedAt = new Date();
    order.trackingStatus = 'Shipped';

    // Send shipping notification email to customer if not already sent
    if (!wasShipped) {
      try {
        const customer = await User.findById(order.user).select('email name');
        if (customer?.email) {
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
            to: customer.email,
            subject: `Your order #${order._id.toString().slice(-8)} has been shipped! 🎉`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #eee; padding: 40px;">
                <h1 style="font-size: 28px; letter-spacing: 3px; margin-bottom: 4px;">SONISH</h1>
                <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 4px; margin-top: 0;">Modern Elegance</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <h2 style="font-size: 20px; color: #111; margin-bottom: 6px;">Your order is on its way!</h2>
                <p style="color: #555; font-size: 14px; line-height: 1.8;">Hi ${customer.name || 'there'},<br/>Great news! Your order has been dispatched and is heading your way.</p>
                <div style="background: #f9f9f9; border: 1px solid #eee; padding: 20px 24px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Order ID</p>
                  <p style="margin: 4px 0 16px; font-size: 16px; font-weight: bold; color: #111;">#${order._id.toString().slice(-8)}</p>
                  ${order.trackingNumber ? `
                  <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Tracking Number</p>
                  <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #c9a84c;">${order.trackingNumber}</p>
                  ` : '<p style="margin: 4px 0 0; font-size: 14px; font-style: italic; color: #666;">Tracking details will be updated soon.</p>'}
                </div>
                ${order.trackingNumber ? `
                <a href="https://www.delhivery.com/track/package/${order.trackingNumber}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 24px;">Track Your Order →</a>
                ` : ''}
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 12px; color: #aaa; text-align: center;">© Sonish Studios · Mumbai, India</p>
              </div>`,
          });
        }
      } catch (emailErr) {
        console.error('Shipping email failed:', emailErr.message);
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderTracking,
  getOrderTracking,
  updateOrderToShipped,
};
