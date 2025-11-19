import React from 'react';

function ServerInfo({ serverInfo }) {
  if (!serverInfo) {
    return (
      <div className="card">
        <h2>Server Information</h2>
        <p>Unable to load server information</p>
      </div>
    );
  }

  const formatUptime = (bootTime) => {
    try {
      const boot = new Date(bootTime);
      const now = new Date();
      const diff = now - boot;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="card">
      <h2>Server Information</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Hostname:</span>
          <span className="info-value">{serverInfo.hostname || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">OS Version:</span>
          <span className="info-value">{serverInfo.osVersion || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Server Time:</span>
          <span className="info-value">{serverInfo.serverTime || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Uptime:</span>
          <span className="info-value">
            {serverInfo.uptime ? formatUptime(serverInfo.uptime) : 'N/A'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Admin Mode:</span>
          <span className="info-value">
            {serverInfo.isAdmin ? (
              <span className="badge badge-success">Running as Admin</span>
            ) : (
              <span className="badge badge-warning">Not Admin</span>
            )}
          </span>
        </div>
      </div>

      {!serverInfo.isAdmin && (
        <div className="warning-box" style={{ marginTop: '15px' }}>
          <strong>Warning:</strong> Application is not running as Administrator.
          Some features may be restricted.
        </div>
      )}
    </div>
  );
}

export default ServerInfo;
