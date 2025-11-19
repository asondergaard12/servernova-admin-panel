const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const userRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Adjust for your needs
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false // In production, serve from same origin
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

// IP whitelist middleware (optional)
app.use((req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS;

  if (allowedIPs) {
    const ipList = allowedIPs.split(',').map(ip => ip.trim());
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!ipList.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied from your IP address' });
    }
  }

  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`ServerNova Admin Panel running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Platform: ${process.platform}`);

  if (process.platform !== 'win32') {
    console.warn('WARNING: This application is designed for Windows Server. Some features may not work on this platform.');
  }
});
