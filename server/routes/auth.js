const express = require('express');
const router = express.Router();
const { verifyAccessCode } = require('../middleware/auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      return res.status(400).json({ error: 'Access code is required' });
    }

    const isValid = await verifyAccessCode(accessCode);

    if (!isValid) {
      // Log failed attempt
      console.warn(`Failed login attempt from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid access code' });
    }

    // Set session
    req.session.authenticated = true;
    req.session.loginTime = new Date().toISOString();

    console.log(`Successful login from IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.session?.authenticated,
    loginTime: req.session?.loginTime
  });
});

module.exports = router;
