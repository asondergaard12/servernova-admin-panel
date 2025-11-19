const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { executePowerShell } = require('../utils/powershell');

// All routes require authentication
router.use(requireAuth);

// Get recent user sign-in events
router.get('/sign-ins', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Query Windows Event Log for logon events
    // Event IDs:
    // 4624 - Successful logon
    // 4625 - Failed logon
    // We'll focus on successful logons (4624)

    const command = `
      Get-WinEvent -FilterHashtable @{
        LogName='Security';
        ID=4624
      } -MaxEvents ${limit} -ErrorAction SilentlyContinue |
      ForEach-Object {
        $event = $_
        $username = $event.Properties[5].Value
        $domain = $event.Properties[6].Value
        $logonType = $event.Properties[8].Value
        $sourceIP = $event.Properties[18].Value
        $processName = $event.Properties[17].Value

        # Map logon types to readable names
        $logonTypeName = switch ($logonType) {
          2 { "Interactive" }
          3 { "Network" }
          4 { "Batch" }
          5 { "Service" }
          7 { "Unlock" }
          8 { "NetworkCleartext" }
          9 { "NewCredentials" }
          10 { "RemoteInteractive (RDP)" }
          11 { "CachedInteractive" }
          default { "Other ($logonType)" }
        }

        [PSCustomObject]@{
          TimeCreated = $event.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
          Username = "$domain\\$username"
          LogonType = $logonTypeName
          SourceIP = if ($sourceIP -and $sourceIP -ne '-') { $sourceIP } else { 'N/A' }
          ProcessName = if ($processName) { $processName } else { 'N/A' }
          EventID = $event.Id
        }
      } |
      Where-Object { $_.Username -notmatch 'SYSTEM|NETWORK SERVICE|LOCAL SERVICE|ANONYMOUS' } |
      Select-Object -First ${limit} |
      ConvertTo-Json
    `;

    const result = await executePowerShell(command);

    if (result.success) {
      let events = [];
      try {
        if (result.stdout) {
          const parsed = JSON.parse(result.stdout);
          events = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (parseError) {
        console.error('Error parsing sign-in events:', parseError);
      }

      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } else {
      // If we don't have permission to read Security log
      if (result.stderr.includes('Access is denied')) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Administrator privileges required to read sign-in history. Please run the application as Administrator.'
        });
      }

      res.status(500).json({
        error: 'Failed to retrieve sign-in history',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error getting sign-in history:', error);
    res.status(500).json({
      error: 'Failed to retrieve sign-in history',
      message: error.message
    });
  }
});

// Get failed login attempts
router.get('/failed-logins', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const command = `
      Get-WinEvent -FilterHashtable @{
        LogName='Security';
        ID=4625
      } -MaxEvents ${limit} -ErrorAction SilentlyContinue |
      ForEach-Object {
        $event = $_
        $username = $event.Properties[5].Value
        $domain = $event.Properties[6].Value
        $sourceIP = $event.Properties[19].Value
        $failureReason = $event.Properties[8].Value

        [PSCustomObject]@{
          TimeCreated = $event.TimeCreated.ToString("yyyy-MM-dd HH:mm:ss")
          Username = "$domain\\$username"
          SourceIP = if ($sourceIP -and $sourceIP -ne '-') { $sourceIP } else { 'N/A' }
          FailureReason = $failureReason
          EventID = $event.Id
        }
      } |
      Select-Object -First ${limit} |
      ConvertTo-Json
    `;

    const result = await executePowerShell(command);

    if (result.success) {
      let events = [];
      try {
        if (result.stdout) {
          const parsed = JSON.parse(result.stdout);
          events = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (parseError) {
        console.error('Error parsing failed login events:', parseError);
      }

      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } else {
      if (result.stderr.includes('Access is denied')) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Administrator privileges required to read security logs'
        });
      }

      res.status(500).json({
        error: 'Failed to retrieve failed login history',
        details: result.stderr
      });
    }
  } catch (error) {
    console.error('Error getting failed login history:', error);
    res.status(500).json({
      error: 'Failed to retrieve failed login history',
      message: error.message
    });
  }
});

// Get current active sessions
router.get('/active-sessions', async (req, res) => {
  try {
    const command = `
      query user 2>&1 | Select-Object -Skip 1 |
      ForEach-Object {
        $line = $_ -split '\\s{2,}'
        if ($line.Count -ge 3) {
          [PSCustomObject]@{
            Username = $line[0].Trim()
            SessionName = if ($line[1]) { $line[1].Trim() } else { 'N/A' }
            SessionID = $line[2].Trim()
            State = if ($line.Count -ge 4) { $line[3].Trim() } else { 'N/A' }
            IdleTime = if ($line.Count -ge 5) { $line[4].Trim() } else { 'N/A' }
            LogonTime = if ($line.Count -ge 6) { $line[5].Trim() } else { 'N/A' }
          }
        }
      } | ConvertTo-Json
    `;

    const result = await executePowerShell(command);

    if (result.success) {
      let sessions = [];
      try {
        if (result.stdout) {
          const parsed = JSON.parse(result.stdout);
          sessions = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (parseError) {
        console.error('Error parsing active sessions:', parseError);
      }

      res.json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } else {
      res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No active sessions found'
      });
    }
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      error: 'Failed to retrieve active sessions',
      message: error.message
    });
  }
});

module.exports = router;
