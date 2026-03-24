import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// User must be authenticated
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization Bearer header (primary – works cross-domain)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fallback: check cookie (for local dev convenience)
  if (!token && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (typeof next === 'function') {
        next();
      } else {
        console.error('CRITICAL: next is not a function in protect middleware');
        res.status(500).json({ message: 'Internal server error: middleware chain broken' });
      }
    } catch (error) {
      console.error('JWT Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };
