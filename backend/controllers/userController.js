import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer';

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
      // Since we are using EmailJS on the frontend, the backend's only job is to generate and save the OTP.
      // We return the otpCode to the React frontend, and EmailJS will dispatch the actual email.
      res.status(200).json({
        message: 'OTP generated',
        otpCode: otpCode,
      });

    } catch (err) {
      console.error('[OTP Generation] Error:', err.message);
      res.status(500).json({
        message: 'Failed to generate OTP. Please try again later.',
      });
    }
  } else {
    res.status(500);
    throw new Error('Failed to create OTP record in database');
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
