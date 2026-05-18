import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getTokenFromHeader = (req) => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  if (!auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
};

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token',
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        statusCode: 401,
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401,
    });
  }
};

export default protect;