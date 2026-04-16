const jwt = require('jsonwebtoken');

// Verifies JWT and attaches user to req
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access: pass allowed roles as array
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// Base-level access: admins see all, others see only their base
const baseFilter = (req, res, next) => {
  if (req.user.role === 'admin') {
    req.baseFilter = null; // no filter
  } else {
    req.baseFilter = req.user.base;
  }
  next();
};

module.exports = { authenticate, authorize, baseFilter };