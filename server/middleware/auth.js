const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me').id;
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};
