const bcrypt = require('bcryptjs');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Verify access code
const verifyAccessCode = async (providedCode) => {
  const correctCode = process.env.ADMIN_ACCESS_CODE;

  if (!correctCode) {
    throw new Error('ADMIN_ACCESS_CODE not configured');
  }

  // Simple comparison for now (consider hashing in production)
  return providedCode === correctCode;
};

module.exports = {
  requireAuth,
  verifyAccessCode
};
