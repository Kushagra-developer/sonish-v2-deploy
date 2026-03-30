import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Coupon from '../models/couponModel.js';
import { Resend } from 'resend';
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
    const enrichedOrderItems = await Promise.all(orderItems.map(async (x) => {
      const productDoc = await Product.findById(x.product || x._id);
      const baseSku = productDoc && productDoc.sku ? productDoc.sku : 'SNH-GEN-0000';
      const sizeSuffix = x.selectedSize ? `-${x.selectedSize}` : '';
      return {
        ...x,
        product: x.product || x._id,
        size: x.selectedSize || 'N/A',
        sku: `${baseSku}${sizeSuffix}`,
      };
    }));

    const order = new Order({
      orderItems: enrichedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
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

    // Clear the user's cart after successful order creation
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    // If coupon was used, increment usage count
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }

    // --- SEND ORDER CONFIRMATION EMAIL via Resend (HTTP, no SMTP) ---
    const userEmail = req.user?.email;
    const userName = req.user?.name;

    const emailData = {
      orderId: createdOrder._id,
      customerEmail: userEmail,
      customerName: userName,
      items: createdOrder.orderItems,
      total: totalPrice,
      address: shippingAddress
    };

    const sendEmailsAsync = async (data) => {
      const orderRef = data.orderId.toString().slice(-8);
      console.log(`[Email] START: Order #${orderRef} dispatch task`);
      
      try {
        // Prepare Items Table (shared by both emails)
        const itemsHtml = data.items.map(item => `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              <strong>${item.name}</strong><br/><small>SKU: ${item.sku} | Size: ${item.size}</small>
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">₹${item.price.toFixed(2)}</td>
          </tr>
        `).join('');

        // ═══════════════════════════════════════════════════════════
        // 1. CUSTOMER EMAIL — via Resend (HTTP, bypasses SMTP block)
        // ═══════════════════════════════════════════════════════════
        if (data.customerEmail && process.env.RESEND_API_KEY) {
          console.log(`[Resend] Sending Customer Receipt to ${data.customerEmail}`);
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data: result, error } = await resend.emails.send({
              from: 'Sonish Studios <onboarding@resend.dev>',
              to: [data.customerEmail],
              subject: `Order Confirmation - #${orderRef}`,
              html: `<div style="font-family:'Helvetica Neue',sans-serif; max-width:600px; margin:auto; border:1px solid #eee; padding:40px;">
                <div style="text-align:center; margin-bottom:30px;">
                  <h1 style="font-size:24px; font-weight:700; letter-spacing:4px; margin:0;">SONISH</h1>
                  <p style="font-size:10px; letter-spacing:2px; color:#999; margin-top:5px;">ORDER CONFIRMATION</p>
                </div>
                <p style="font-size:16px; color:#333;">Hello ${data.customerName}, your order <strong>#${orderRef}</strong> is confirmed!</p>
                <table style="width:100%; border-collapse:collapse; margin:20px 0;">${itemsHtml}</table>
                <h3 style="text-align:right; border-top:2px solid #eee; padding-top:15px; color:#000;">Total: ₹${data.total.toFixed(2)}</h3>
                <div style="border-top:1px solid #eee; padding-top:20px; margin-top:20px; text-align:center; font-size:11px; color:#999;">
                  <p>© ${new Date().getFullYear()} Sonish Studios. All rights reserved.</p>
                </div>
              </div>`
            });
            if (error) {
              console.error(`[Resend] FAIL (Customer): #${orderRef} ->`, error);
            } else {
              console.log(`[Resend] SUCCESS: Customer receipt sent for #${orderRef}`, result);
            }
          } catch (err) {
            console.error(`[Resend] FAIL (Customer): #${orderRef} ->`, err.message);
          }
        }

        // ═══════════════════════════════════════════════════════════
        // 2. ADMIN EMAIL — via Gmail SMTP (service: "gmail")
        //    Pattern from user's Firebase function
        // ═══════════════════════════════════════════════════════════
        const adminEmail = process.env.ADMIN_EMAIL || 'sonishfashion@gmail.com';
        console.log(`[SMTP] Preparing Admin Alert for ${adminEmail}`);

        const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;padding:30px;color:#111827}
.card{background:#fff;border-radius:14px;max-width:580px;margin:auto;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#1a1a1a,#333);padding:26px;color:#fff}
.header h1{font-size:20px;font-weight:700;letter-spacing:3px}
.header p{font-size:13px;opacity:.9;margin-top:4px}
.body{padding:26px}
.section-title{font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;margin:20px 0 10px}
table{width:100%;border-collapse:collapse}
td{padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px}
td:first-child{font-weight:600;color:#374151;width:40%}
tr:nth-child(even){background:#f9fafb}
.total-box{margin:18px 0;padding:22px;text-align:center;border-radius:12px;background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px dashed #c9a84c}
.total-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#92400e;margin-bottom:10px}
.total{font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:4px;color:#78350f}
.footer{background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;padding:12px;color:#6b7280}
</style></head>
<body>
<div class="card">
  <div class="header">
    <h1>SONISH</h1>
    <p>🛍️ New Order Received — #${orderRef}</p>
  </div>
  <div class="body">
    <div class="section-title">Customer Information</div>
    <table>
      <tr><td>Customer Name</td><td>${data.customerName}</td></tr>
      <tr><td>Email</td><td>${data.customerEmail}</td></tr>
    </table>
    <div class="section-title">Order Items</div>
    <table>${itemsHtml}</table>
    <div class="total-box">
      <div class="total-title">Order Total</div>
      <div class="total">₹${data.total.toFixed(2)}</div>
    </div>
    <div class="section-title">Shipping Address</div>
    <table>
      <tr><td>Address</td><td>${data.address.address}</td></tr>
      <tr><td>City</td><td>${data.address.city}</td></tr>
      <tr><td>Postal Code</td><td>${data.address.postalCode || 'N/A'}</td></tr>
      <tr><td>Country</td><td>${data.address.country || 'India'}</td></tr>
    </table>
  </div>
  <div class="footer">
    Automated notification from <strong>Sonish Order System</strong> · Do not reply
  </div>
</div>
</body></html>`;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const info = await transporter.sendMail({
              from: `"Sonish System" <${process.env.EMAIL_USER}>`,
              to: adminEmail,
              subject: `[NEW ORDER] #${orderRef} — ₹${data.total.toFixed(2)}`,
              html: adminHtml,
            });

            console.log(`[SMTP] ✅ Admin alert sent for #${orderRef} — Message ID: ${info.messageId}`);
          } catch (smtpErr) {
            console.error(`[SMTP] ❌ Admin SMTP failed for #${orderRef}:`, smtpErr.message);
            
            // Fallback: try Resend if SMTP fails
            if (process.env.RESEND_API_KEY) {
              console.log(`[Resend] Attempting fallback for Admin #${orderRef}...`);
              try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const { error } = await resend.emails.send({
                  from: 'Sonish System <onboarding@resend.dev>',
                  to: [adminEmail],
                  subject: `[NEW ORDER] #${orderRef} — ₹${data.total.toFixed(2)}`,
                  html: adminHtml,
                });
                if (error) {
                  console.error(`[Resend] Fallback also failed:`, error);
                } else {
                  console.log(`[Resend] ✅ Fallback Admin alert sent for #${orderRef}`);
                }
              } catch (fallbackErr) {
                console.error(`[Resend] Fallback error:`, fallbackErr.message);
              }
            }
          }
        } else if (process.env.RESEND_API_KEY) {
          // No SMTP creds, use Resend directly
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { error } = await resend.emails.send({
              from: 'Sonish System <onboarding@resend.dev>',
              to: [adminEmail],
              subject: `[NEW ORDER] #${orderRef} — ₹${data.total.toFixed(2)}`,
              html: adminHtml,
            });
            if (error) {
              console.error(`[Resend] FAIL (Admin): #${orderRef} ->`, error);
            } else {
              console.log(`[Resend] ✅ Admin alert sent for #${orderRef}`);
            }
          } catch (err) {
            console.error(`[Resend] FAIL (Admin): #${orderRef} ->`, err.message);
          }
        } else {
          console.error(`[Email] ABORT: No EMAIL_USER/EMAIL_PASS or RESEND_API_KEY for Admin #${orderRef}`);
        }

        console.log(`[Email] FINISH: Order #${orderRef} task complete`);

      } catch (globalErr) {
        console.error(`[Email] FATAL: Order #${orderRef} background failure:`, globalErr.message);
      }
    };

    // Trigger emails in background
    sendEmailsAsync(emailData);
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
