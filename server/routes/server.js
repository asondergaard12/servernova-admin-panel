const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { executePowerShell, isAdmin } = require('../utils/powershell');

// All routes require authentication
router.use(requireAuth);

// Get server information
router.get('/info', async (req, res) => {
  try {
    const commands = {
      hostname: 'hostname',
      osVersion: '(Get-WmiObject -Class Win32_OperatingSystem).Caption',
      osVersion: '(Get-CimInstance Win32_OperatingSystem).Caption',
      uptime: '(Get-CimInstance Win32_OperatingSystem).LastBootUpTime',
      serverTime: 'Get-Date -Format "yyyy-MM-dd HH:mm:ss"'
    };

    const results = {};

    for (const [key, command] of Object.entries(commands)) {
      try {
        const result = await executePowerShell(command);
        results[key] = result.success ? result.stdout : 'N/A';
      } catch (error) {
        results[key] = 'Error';
      }
    }

    // Check admin status
    results.isAdmin = await isAdmin();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    res.status(500).json({ error: 'Failed to retrieve server information' });
  }
});

// Restart server
router.post('/restart', async (req, res) => {
  try {
    // Check if running as admin
    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return res.status(403).json({
        error: 'Administrator privileges required',
        message: 'The application must be run as Administrator to restart the server'
      });
    }

    const { delay = 30 } = req.body; // Default 30 second delay

    // Validate delay
    if (delay < 10 || delay > 600) {
      return res.status(400).json({
        error: 'Invalid delay',
        message: 'Delay must be between 10 and 600 seconds'
      });
    }

    // Log the restart request
    console.log(`Server restart requested by session at ${new Date().toISOString()}`);
    console.log(`Restart will occur in ${delay} seconds`);

    // Schedule restart (shutdown with restart flag, not shutdown)
    const command = `shutdown /r /t ${delay} /c "Server restart requested via Admin Panel"`;

    const result = await executePowerShell(command, true);

    if (result.success) {
      res.json({
        success: true,
        message: `Server will restart in ${delay} seconds`,
        delay: delay
      });
    } else {
      res.status(500).json({
        error: 'Failed to schedule restart',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error restarting server:', error);
    res.status(500).json({
      error: 'Failed to restart server',
      message: error.message
    });
  }
});

// Cancel pending restart
router.post('/cancel-restart', async (req, res) => {
  try {
    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return res.status(403).json({
        error: 'Administrator privileges required'
      });
    }

    const result = await executePowerShell('shutdown /a', true);

    if (result.success) {
      res.json({
        success: true,
        message: 'Pending restart cancelled'
      });
    } else {
      // If no pending restart, shutdown /a returns error
      res.json({
        success: false,
        message: 'No pending restart to cancel'
      });
    }
  } catch (error) {
    console.error('Error cancelling restart:', error);
    res.status(500).json({
      error: 'Failed to cancel restart',
      message: error.message
    });
  }
});

module.exports = router;
