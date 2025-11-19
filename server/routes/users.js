const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { executePowerShell, isAdmin } = require('../utils/powershell');

// All routes require authentication
router.use(requireAuth);

// Get list of local users
router.get('/', async (req, res) => {
  try {
    const command = `Get-LocalUser | Select-Object Name, Enabled, Description, LastLogon, PasswordLastSet, PasswordExpires | ConvertTo-Json`;

    const result = await executePowerShell(command);

    if (result.success) {
      let users = [];
      try {
        const parsed = JSON.parse(result.stdout);
        // Handle single user (not array) or multiple users
        users = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        console.error('Error parsing users:', parseError);
      }

      res.json({
        success: true,
        data: users
      });
    } else {
      res.status(500).json({
        error: 'Failed to retrieve users',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
});

// Create new local user
router.post('/create', async (req, res) => {
  try {
    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return res.status(403).json({
        error: 'Administrator privileges required',
        message: 'The application must be run as Administrator to create users'
      });
    }

    const { username, password, fullName, description } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Validate username (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be 3-20 characters and contain only letters, numbers, underscore, or hyphen'
      });
    }

    // Check if user already exists
    const checkCommand = `Get-LocalUser -Name "${username}" -ErrorAction SilentlyContinue`;
    const checkResult = await executePowerShell(checkCommand);

    if (checkResult.stdout) {
      return res.status(409).json({
        error: 'User already exists',
        message: `A user with username "${username}" already exists`
      });
    }

    // Create the user
    let command = `$SecurePassword = ConvertTo-SecureString "${password}" -AsPlainText -Force; `;
    command += `New-LocalUser -Name "${username}" -Password $SecurePassword`;

    if (fullName) {
      command += ` -FullName "${fullName}"`;
    }

    if (description) {
      command += ` -Description "${description}"`;
    }

    command += ` -PasswordNeverExpires:$false`;

    const result = await executePowerShell(command, true);

    if (result.success) {
      console.log(`User created: ${username}`);
      res.json({
        success: true,
        message: `User "${username}" created successfully`,
        username: username
      });
    } else {
      res.status(500).json({
        error: 'Failed to create user',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Lock/Unlock user
router.post('/toggle-lock', async (req, res) => {
  try {
    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return res.status(403).json({
        error: 'Administrator privileges required',
        message: 'The application must be run as Administrator to lock/unlock users'
      });
    }

    const { username, action } = req.body;

    if (!username || !action) {
      return res.status(400).json({
        error: 'Username and action are required'
      });
    }

    if (action !== 'lock' && action !== 'unlock') {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Action must be "lock" or "unlock"'
      });
    }

    // Check if user exists
    const checkCommand = `Get-LocalUser -Name "${username}" -ErrorAction SilentlyContinue`;
    const checkResult = await executePowerShell(checkCommand);

    if (!checkResult.stdout) {
      return res.status(404).json({
        error: 'User not found',
        message: `User "${username}" does not exist`
      });
    }

    // Lock (disable) or unlock (enable) the user
    const command = action === 'lock'
      ? `Disable-LocalUser -Name "${username}"`
      : `Enable-LocalUser -Name "${username}"`;

    const result = await executePowerShell(command, true);

    if (result.success) {
      const actionText = action === 'lock' ? 'locked (disabled)' : 'unlocked (enabled)';
      console.log(`User ${actionText}: ${username}`);
      res.json({
        success: true,
        message: `User "${username}" ${actionText} successfully`,
        username: username,
        action: action
      });
    } else {
      res.status(500).json({
        error: `Failed to ${action} user`,
        details: result.stderr
      });
    }
  } catch (error) {
    console.error(`Error ${req.body.action}ing user:`, error);
    res.status(500).json({
      error: `Failed to ${req.body.action} user`,
      message: error.message
    });
  }
});

// Delete user
router.delete('/:username', async (req, res) => {
  try {
    const adminStatus = await isAdmin();

    if (!adminStatus) {
      return res.status(403).json({
        error: 'Administrator privileges required',
        message: 'The application must be run as Administrator to delete users'
      });
    }

    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        error: 'Username is required'
      });
    }

    // Check if user exists
    const checkCommand = `Get-LocalUser -Name "${username}" -ErrorAction SilentlyContinue`;
    const checkResult = await executePowerShell(checkCommand);

    if (!checkResult.stdout) {
      return res.status(404).json({
        error: 'User not found',
        message: `User "${username}" does not exist`
      });
    }

    const command = `Remove-LocalUser -Name "${username}"`;
    const result = await executePowerShell(command, true);

    if (result.success) {
      console.log(`User deleted: ${username}`);
      res.json({
        success: true,
        message: `User "${username}" deleted successfully`,
        username: username
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete user',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

module.exports = router;
