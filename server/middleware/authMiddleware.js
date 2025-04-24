import { verify } from 'jsonwebtoken';
import { findById } from '../models/User.js';

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    try {
      token = token.split(' ')[1];

      const decoded = verify(token, process.env.JWT_SECRET);
      req.user = await findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default { protect };
