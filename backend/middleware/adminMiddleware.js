// Must run after `protect`.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access forbidden: admins only' });
  }
  next();
};

module.exports = { adminOnly };
