import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV !== 'development';

  // Set JWT as HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,       // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax',  // 'none' required for cross-domain (Vercel↔Render)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
