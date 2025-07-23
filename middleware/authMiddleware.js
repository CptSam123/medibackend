import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If it's our built-in admin (no DB record)
    if (decoded.role === 'admin' && decoded.id === 'admin-id') {
      req.user = { _id: decoded.id, role: 'admin', name: 'Administrator', email: process.env.ADMIN_EMAIL };
    } else {
      // Normal users/doctors
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export default authMiddleware;
