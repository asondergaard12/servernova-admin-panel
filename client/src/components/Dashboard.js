import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServerInfo from './ServerInfo';
import ServerControl from './ServerControl';
import UserManagement from './UserManagement';
import SignInHistory from './SignInHistory';

function Dashboard({ onLogout }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServerInfo();
  }, []);

  const fetchServerInfo = async () => {
    try {
      const response = await axios.get('/api/server/info');
      setServerInfo(response.data.data);
    } catch (error) {
      console.error('Failed to fetch server info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>ServerNova Admin Panel</h1>
        <button onClick={onLogout} className="btn-logout">
          Logout
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <ServerInfo serverInfo={serverInfo} />
            <ServerControl serverInfo={serverInfo} />
          </div>

          <div className="dashboard-grid">
            <UserManagement />
          </div>

          <div className="dashboard-grid">
            <SignInHistory />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
