const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verify JWT ──────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authorized, no token' });

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// ─── Role guard factory ───────────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
  next();
};

module.exports = { protect, authorize };
