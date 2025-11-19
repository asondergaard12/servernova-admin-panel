# ServerNova Admin Panel

A secure, client-facing admin panel for Windows Server management. Provides authorized clients with controlled access to essential server management functions through a modern web interface.

## Features

- **Secure Access Control**: Password-protected access with customizable security codes
- **Server Management**: Restart server with configurable delay and confirmation
- **User Management**: Create, lock/unlock, and delete local Windows users
- **Audit & Monitoring**: View user sign-in history with IP addresses, protocols, and session details
- **Modern UI**: Clean, responsive interface that works on desktop and mobile
- **Windows Server 2016+**: Full compatibility with Windows Server 2016 and above

## Requirements

- **Operating System**: Windows Server 2016 or higher
- **Node.js**: Version 14.x or higher
- **Administrator Privileges**: Required for most features (user management, server restart, security logs)

## Installation

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd servernova-admin-panel
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Security Code - CHANGE THIS!
ADMIN_ACCESS_CODE=YourSecureAccessCode123!

# Session Secret - CHANGE THIS!
SESSION_SECRET=YourRandomSecretKey456!

# Optional: IP Whitelist (comma-separated)
# ALLOWED_IPS=192.168.1.100,192.168.1.101
```

**Important**: Change the default `ADMIN_ACCESS_CODE` and `SESSION_SECRET` to secure values!

### 4. Build the Frontend

```bash
cd client
npm run build
cd ..
```

## Running the Application

### Development Mode

```bash
# Terminal 1 - Run backend
npm run dev

# Terminal 2 - Run frontend
npm run client
```

The frontend will be available at `http://localhost:3000` and backend at `http://localhost:3001`.

### Production Mode

**IMPORTANT**: Run as Administrator for full functionality!

1. Right-click Command Prompt or PowerShell
2. Select "Run as Administrator"
3. Navigate to the project directory
4. Start the server:

```bash
npm start
```

The application will be available at `http://localhost:3001` (or your configured PORT).

### Running as Windows Service (Recommended for Production)

For production deployments, it's recommended to run the application as a Windows service using tools like:

- **NSSM (Non-Sucking Service Manager)**: https://nssm.cc/
- **node-windows**: npm package for creating Windows services

#### Example with NSSM:

```bash
# Download and install NSSM
# Then run:
nssm install ServerNovaAdmin "C:\Program Files\nodejs\node.exe"
nssm set ServerNovaAdmin AppDirectory "C:\path\to\servernova-admin-panel"
nssm set ServerNovaAdmin AppParameters "server/index.js"
nssm set ServerNovaAdmin AppEnvironmentExtra "NODE_ENV=production"
nssm start ServerNovaAdmin
```

## Usage

### Login

1. Navigate to the application URL (e.g., `http://localhost:3001`)
2. Enter the access code you configured in `.env`
3. Click "Login"

### Server Information

- View hostname, OS version, uptime, and admin status
- Monitor whether the application is running with administrator privileges

### Server Control

- **Restart Server**: Schedule a server restart with configurable delay (10-600 seconds)
- **Cancel Restart**: Cancel a pending restart if needed
- Requires Administrator privileges

### User Management

- **View Users**: See all local Windows users with their status and last logon
- **Create User**: Add new local Windows users with username, password, and optional details
- **Lock/Unlock Users**: Enable or disable user accounts
- **Delete Users**: Remove user accounts from the system
- Requires Administrator privileges

### Sign-In History

- **Successful Logins**: View recent successful user sign-ins with:
  - Timestamp
  - Username
  - Logon type (Interactive, RDP, Network, etc.)
  - Source IP address
  - Process name
- **Failed Logins**: Monitor failed login attempts
- **Active Sessions**: See currently logged-in users and their session details
- Configurable record limit (25, 50, 100, 200)
- Requires Administrator privileges to read Security event logs

## Security Considerations

### Best Practices

1. **Change Default Credentials**: Always change `ADMIN_ACCESS_CODE` and `SESSION_SECRET`
2. **Use HTTPS**: Deploy behind a reverse proxy (IIS, nginx) with SSL/TLS
3. **IP Whitelisting**: Configure `ALLOWED_IPS` to restrict access to specific IP addresses
4. **Firewall Rules**: Configure Windows Firewall to limit access to the application port
5. **Regular Updates**: Keep Node.js and dependencies up to date
6. **Audit Logs**: Monitor application logs and Windows Event Logs for suspicious activity
7. **Strong Access Codes**: Use complex, unique access codes (minimum 16 characters)

### Running as Administrator

Most features require Administrator privileges:
- Creating, modifying, or deleting users
- Restarting the server
- Reading Security event logs (sign-in history)

To run as Administrator:
```bash
# Right-click PowerShell/CMD -> Run as Administrator
cd C:\path\to\servernova-admin-panel
npm start
```

### Reverse Proxy with IIS (Recommended)

For production, use IIS with URL Rewrite and Application Request Routing:

1. Install IIS with URL Rewrite and ARR modules
2. Create a new site in IIS
3. Configure reverse proxy to `http://localhost:3001`
4. Enable SSL/TLS certificate
5. Configure authentication if needed

## Troubleshooting

### "Administrator privileges required" errors

**Solution**: Run the application as Administrator (see above)

### Cannot read Security event logs

**Issue**: "Access is denied" when viewing sign-in history

**Solution**:
- Run the application as Administrator
- Ensure the account has permissions to read Security event logs

### PowerShell execution errors

**Issue**: PowerShell commands fail to execute

**Solution**:
- Verify PowerShell is available on the system
- Check Windows Server version (2016+)
- Ensure PowerShell execution policy allows scripts

### Port already in use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:
- Change the `PORT` in `.env` to an available port
- Or stop the process using port 3001

### Users not appearing in User Management

**Issue**: User list is empty or incomplete

**Solution**:
- Run as Administrator
- Verify PowerShell command: `Get-LocalUser` works in PowerShell

## File Structure

```
servernova-admin-panel/
├── server/
│   ├── index.js                 # Express server
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── server.js            # Server management routes
│   │   ├── users.js             # User management routes
│   │   └── audit.js             # Audit/sign-in history routes
│   └── utils/
│       └── powershell.js        # PowerShell execution utility
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js         # Login component
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── ServerInfo.js    # Server information display
│   │   │   ├── ServerControl.js # Server restart controls
│   │   │   ├── UserManagement.js # User management interface
│   │   │   └── SignInHistory.js # Sign-in history viewer
│   │   ├── App.js               # Main React app
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Styles
│   └── package.json
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate with access code
- `POST /api/auth/logout` - End session
- `GET /api/auth/status` - Check authentication status

### Server Management
- `GET /api/server/info` - Get server information
- `POST /api/server/restart` - Schedule server restart
- `POST /api/server/cancel-restart` - Cancel pending restart

### User Management
- `GET /api/users` - List all local users
- `POST /api/users/create` - Create new user
- `POST /api/users/toggle-lock` - Lock/unlock user
- `DELETE /api/users/:username` - Delete user

### Audit & Monitoring
- `GET /api/audit/sign-ins` - Get successful sign-in history
- `GET /api/audit/failed-logins` - Get failed login attempts
- `GET /api/audit/active-sessions` - Get active user sessions

## Support

For issues, questions, or feature requests, please contact your system administrator.

## License

Proprietary - For authorized client use only.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-19
**Compatible With**: Windows Server 2016, 2019, 2022
