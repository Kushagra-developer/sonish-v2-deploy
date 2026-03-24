import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });

  // Return the token string so the controller can include it in the JSON response
  return token;
};

export default generateToken;
