import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import generateToken from '../utils/generateToken.js';
import { Resend } from 'resend';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      cart: user.cart,
      wishlist: user.wishlist,
      shippingAddress: user.shippingAddress,
      savedAddresses: user.savedAddresses,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      cart: user.cart,
      wishlist: user.wishlist,
      shippingAddress: user.shippingAddress,
      savedAddresses: user.savedAddresses,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      cart: user.cart,
      wishlist: user.wishlist,
      shippingAddress: user.shippingAddress,
      savedAddresses: user.savedAddresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.shippingAddress) {
      if (!user.shippingAddress) user.shippingAddress = {};
      
      user.shippingAddress.address = req.body.shippingAddress.address || user.shippingAddress.address || '';
      user.shippingAddress.city = req.body.shippingAddress.city || user.shippingAddress.city || '';
      user.shippingAddress.postalCode = req.body.shippingAddress.postalCode || user.shippingAddress.postalCode || '';
      user.shippingAddress.country = req.body.shippingAddress.country || user.shippingAddress.country || '';
      
      user.markModified('shippingAddress');
    }

    if (req.body.savedAddresses !== undefined) {
      user.savedAddresses = req.body.savedAddresses;
      user.markModified('savedAddresses');
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      cart: updatedUser.cart,
      wishlist: updatedUser.wishlist,
      shippingAddress: updatedUser.shippingAddress,
      savedAddresses: updatedUser.savedAddresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Sync user cart and wishlist
// @route   PUT /api/users/sync
// @access  Private
const syncUserCartAndWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.cart) user.cart = req.body.cart;
    if (req.body.wishlist) user.wishlist = req.body.wishlist;

    await user.save();

    res.json({ message: 'Synced successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Send OTP to email
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(`[Auth] OTP request received for: ${email}`);

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  // Generate a random 4-digit OTP
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

  // Clear existing OTP requests for this email to prevent spam issues
  await Otp.deleteMany({ email });

  // Save the new OTP
  const otpEntry = await Otp.create({
    email,
    otp: otpCode,
  });

  if (otpEntry) {
    try {
      // Guard: Check if Resend is configured
      if (!process.env.RESEND_API_KEY) {
        console.error('[Resend] Attempted OTP dispatch without RESEND_API_KEY');
        return res.status(503).json({
          message: 'Email service is not yet configured. Please contact the administrator.',
        });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Sonish Studios <onboarding@resend.dev>',
        to: [email],
        subject: `${otpCode} is your Sonish verification code`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; background-color: #ffffff; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000000;">SONISH</h1>
              <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; color: #999;">Secure Authentication</p>
            </div>
            
            <div style="margin-bottom: 40px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Verification Code</p>
              <div style="background-color: #f9f9f9; padding: 30px; text-align: center; border-radius: 4px;">
                <span style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #000000;">${otpCode}</span>
              </div>
            </div>
            
            <div style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 40px;">
              <p>This code will expire in 5 minutes. For your security, do not share this code with anyone.</p>
              <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>
            
            <div style="border-top: 1px solid #f0f0f0; padding-top: 30px; text-align: center; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
              <p>&copy; ${new Date().getFullYear()} Sonish Studios. All rights reserved.</p>
              <p>Connect with us at connect@sonish.co.in</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('[Resend] OTP dispatch error:', error);
        return res.status(500).json({
          message: 'Email gateway connection failed. Please try again later.',
        });
      }

      console.log(`[Resend] OTP dispatched to ${email}:`, data);

      res.status(200).json({
        message: 'OTP sent securely to your inbox',
        mockOtp: process.env.NODE_ENV === 'production' ? null : otpCode,
      });

    } catch (err) {
      console.error('[Resend] OTP Gateway Error:', err);
      res.status(500).json({
        message: 'Email gateway connection failed. Please try again later.',
      });
    }
  } else {
    res.status(500);
    throw new Error('Failed to generate OTP');
  }
};

// @desc    Verify OTP & login/register user
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email address and OTP are required');
  }

  // Verify the OTP
  const otpRecord = await Otp.findOne({ email, otp });

  if (!otpRecord) {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }

  // Clear the OTP to prevent reuse
  await Otp.deleteOne({ _id: otpRecord._id });

  // Find user by email, or create one if they don't exist
  let user = await User.findOne({ email });

  if (!user) {
    console.log(`[Auth] Creating new user for: ${email}`);
    user = await User.create({
      email,
      name: email.split('@')[0], // Extract first part of email for the placeholder name
    });
  }

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      cart: user.cart,
      wishlist: user.wishlist,
      token: generateToken(res, user._id),
      isNewUser: user.name === email.split('@')[0]
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Get all users (excluding passwords) for Admin
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  syncUserCartAndWishlist,
  sendOtp,
  verifyOtp,
  getUsers
};
