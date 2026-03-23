import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

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
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
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
    generateToken(res, user._id);

    res.status(201).json({
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
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
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
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.shippingAddress) {
      if (!user.shippingAddress) user.shippingAddress = {};
      
      // Update individual fields to ensure Mongoose tracks the changes to the nested object
      user.shippingAddress.address = req.body.shippingAddress.address || user.shippingAddress.address || '';
      user.shippingAddress.city = req.body.shippingAddress.city || user.shippingAddress.city || '';
      user.shippingAddress.postalCode = req.body.shippingAddress.postalCode || user.shippingAddress.postalCode || '';
      user.shippingAddress.country = req.body.shippingAddress.country || user.shippingAddress.country || '';
      
      // Explicitly tell Mongoose that this nested object has changed
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
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV !== 'development';
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});


// @desc    Sync user cart and wishlist
// @route   PUT /api/users/sync
// @access  Private
const syncUserCartAndWishlist = asyncHandler(async (req, res) => {
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
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  syncUserCartAndWishlist,
};
