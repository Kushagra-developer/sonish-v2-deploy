import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Coupon from '../models/couponModel.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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
    discountPrice,
    couponCode,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    let isPaidVerify = false;
    let paymentResultData = null;

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      
      if (expectedSignature === razorpay_signature) {
        isPaidVerify = true;
        paymentResultData = {
          id: razorpay_payment_id,
          status: 'captured',
          update_time: new Date().toISOString(),
        };
      } else {
        res.status(400);
        throw new Error('Invalid payment signature');
      }
    }
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
      taxPrice,
      shippingPrice,
      totalPrice,
      discountPrice,
      couponCode,
      isPaid: isPaidVerify,
      paidAt: isPaidVerify ? Date.now() : null,
      paymentResult: paymentResultData,
    });

    const createdOrder = await order.save();

    // If coupon was used, increment usage count
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }
    // --- SEND ORDER CONFIRMATION EMAIL ---
    try {
      if (req.user && req.user.email) {
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

        const itemsHtml = createdOrder.orderItems.map(item => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
              <span style="font-size: 14px; color: #111;">${item.name}</span><br/>
              <span style="font-size: 11px; color: #999;">Qty: ${item.qty}</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: #c9a84c;">
              ₹${item.price.toFixed(2)}
            </td>
          </tr>
        `).join('');

        const info = await transporter.sendMail({
          from: `"Sonish Studios" <${process.env.EMAIL_USER || 'no-reply@sonish.co.in'}>`,
          to: req.user.email,
          subject: `Order Confirmation - Receipt #${createdOrder._id.toString().slice(-8)}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #eee; padding: 40px;">
              <h1 style="font-size: 28px; letter-spacing: 3px; margin-bottom: 4px; text-align: center;">SONISH</h1>
              <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 4px; margin-top: 0; text-align: center;">Modern Elegance</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
              
              <h2 style="font-size: 20px; color: #111; margin-bottom: 6px;">Thank you for your order, ${req.user.name || 'valued customer'}.</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.8;">We've received your order and are preparing it for shipment. Here are your order details:</p>
              
              <div style="background: #f9f9f9; padding: 24px; margin: 24px 0; border: 1px solid #eee;">
                <p style="margin: 0 0 16px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Order Summary (#${createdOrder._id.toString().slice(-8)})</p>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 16px 0 8px; font-size: 12px; color: #999; text-transform: uppercase;">Subtotal</td>
                    <td style="padding: 16px 0 8px; text-align: right; font-size: 14px; color: #111;">₹${itemsPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase;">Shipping</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #111;">₹${shippingPrice.toFixed(2)}</td>
                  </tr>
                  ${discountPrice > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase;">Discount ${couponCode ? '(' + couponCode + ')' : ''}</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 14px; color: #c9a84c;">-₹${discountPrice.toFixed(2)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 16px 0 0; font-size: 14px; font-weight: bold; color: #111; text-transform: uppercase; border-top: 1px solid #ddd;">Total</td>
                    <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #111; border-top: 1px solid #ddd;">₹${totalPrice.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 32px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Shipping Address</p>
                <p style="margin: 0; color: #111; font-size: 14px; line-height: 1.6;">
                  ${shippingAddress.address}<br/>
                  ${shippingAddress.city}, ${shippingAddress.postalCode}<br/>
                  ${shippingAddress.country}
                </p>
              </div>

              <a href="${process.env.CORS_ORIGIN?.split(',')[0]}/profile" style="display: block; text-align: center; background: #111; color: #fff; text-decoration: none; padding: 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-top: 40px;">View Order History</a>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
              <p style="font-size: 11px; color: #aaa; text-align: center; line-height: 1.6;">If you have any questions, simply reply to this email.<br/>© Sonish Studios · Mumbai, India</p>
            </div>`
        });

        // Notify Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'sachdevak806@gmail.com';
        await transporter.sendMail({
          from: `"Sonish Studios System" <${process.env.EMAIL_USER || 'no-reply@sonish.co.in'}>`,
          to: adminEmail,
          subject: `[ACTION REQUIRED] New Order Received - #${createdOrder._id.toString().slice(-8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>New Order Received!</h2>
              <p>Customer <strong>${req.user.name}</strong> (${req.user.email}) just placed an order for <strong>₹${totalPrice.toFixed(2)}</strong>.</p>
              <p>Please log in to the admin dashboard to review and fulfill order <strong>#${createdOrder._id.toString().slice(-8)}</strong>.</p>
              <br/>
              <h3>Order Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
              <br/>
              <h3>Shipping to:</h3>
              <p>${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
            </div>
          `
        });

        if (!process.env.EMAIL_USER) {
          console.log('Preview Order Email URL: %s', nodemailer.getTestMessageUrl(info));
        }
      }
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }
    // --- END EMAIL LOGIC ---

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
