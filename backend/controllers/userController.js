import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import MojoAuth from 'mojoauth-sdk';

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
// @desc    Send OTP to email (Legacy, handled by MojoAuth frontend now)
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  res.status(200).json({
    message: 'OTP dispatch is now handled securely by MojoAuth. Please use the login widget.',
  });
};

// @desc    Verify MojoAuth Token & login/register user
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { jwtToken } = req.body;

  if (!jwtToken) {
    res.status(400);
    throw new Error('Authentication token is required');
  }

  try {
    // 1. Guard: Check if MojoAuth is configured
    const apiKey = process.env.MOJOAUTH_API_KEY || "2fb8a130-b384-4a2f-9685-5f296613dddd"; 
    
    // MojoAuth SDK initialization pattern
    const mojoauth = MojoAuth({ apiKey });
    
    // 2. Verify the Token
    const mojoUser = await mojoauth.mojoAPI.verifyToken(jwtToken);
    
    if (!mojoUser || !mojoUser.identifier) {
      res.status(401);
      throw new Error('MojoAuth verification failed or returned no identifier');
    }

    const email = mojoUser.identifier;
    console.log(`[Auth] MojoAuth verified identity: ${email}`);

    // 3. Find user by email, or create one if they don't exist
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`[Auth] Creating new user for: ${email}`);
      user = await User.create({
        email,
        name: email.split('@')[0], 
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
      throw new Error('Could not synchronize MojoAuth identity with local user');
    }

  } catch (err) {
    console.error('[MojoAuth] Token Verification Failure:', err);
    res.status(401).json({
      message: 'Secure authentication failed. Please try again.',
      details: err.message
    });
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
