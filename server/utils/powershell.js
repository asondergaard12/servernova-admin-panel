const { spawn } = require('child_process');

/**
 * Execute a PowerShell command
 * @param {string} command - PowerShell command to execute
 * @param {boolean} asAdmin - Whether to run as administrator
 * @returns {Promise<{stdout: string, stderr: string, success: boolean}>}
 */
function executePowerShell(command, asAdmin = false) {
  return new Promise((resolve, reject) => {
    // Check if running on Windows
    if (process.platform !== 'win32') {
      return reject(new Error('PowerShell commands can only be executed on Windows'));
    }

    const args = [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      command
    ];

    if (asAdmin) {
      args.unshift('-ExecutionPolicy', 'Bypass');
    }

    const ps = spawn('powershell.exe', args, {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    ps.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ps.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ps.on('error', (error) => {
      reject(error);
    });

    ps.on('close', (code) => {
      const result = {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: code === 0,
        exitCode: code
      };

      if (code === 0) {
        resolve(result);
      } else {
        // Still resolve but with success: false
        resolve(result);
      }
    });
  });
}

/**
 * Check if the process is running with administrator privileges
 * @returns {Promise<boolean>}
 */
async function isAdmin() {
  try {
    const result = await executePowerShell(
      '([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)'
    );
    return result.stdout.trim().toLowerCase() === 'true';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

module.exports = {
  executePowerShell,
  isAdmin
};
