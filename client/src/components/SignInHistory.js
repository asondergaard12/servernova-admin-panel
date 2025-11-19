import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SignInHistory() {
  const [signIns, setSignIns] = useState([]);
  const [activeTab, setActiveTab] = useState('successful');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchSignIns();
  }, [activeTab, limit]);

  const fetchSignIns = async () => {
    setLoading(true);
    setError('');

    try {
      let endpoint = '/api/audit/sign-ins';
      if (activeTab === 'failed') {
        endpoint = '/api/audit/failed-logins';
      } else if (activeTab === 'active') {
        endpoint = '/api/audit/active-sessions';
      }

      const response = await axios.get(`${endpoint}?limit=${limit}`);

      if (response.data.success) {
        setSignIns(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sign-in history:', err);
      setError(
        err.response?.data?.error || 'Failed to fetch sign-in history'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2>Sign-In History & Active Sessions</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('successful')}
          className={`btn btn-sm ${
            activeTab === 'successful' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Successful Logins
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          className={`btn btn-sm ${
            activeTab === 'failed' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Failed Logins
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`btn btn-sm ${
            activeTab === 'active' ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          Active Sessions
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="limit" style={{ fontSize: '14px' }}>Limit:</label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: '6px 12px',
              borderRadius: '5px',
              border: '2px solid #e0e0e0',
              fontSize: '14px'
            }}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
          <button
            onClick={fetchSignIns}
            className="btn btn-sm btn-secondary"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading {activeTab} data...</p>
        </div>
      ) : (
        <div className="table-container">
          {activeTab === 'successful' && (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Username</th>
                  <th>Logon Type</th>
                  <th>Source IP</th>
                  <th>Process</th>
                </tr>
              </thead>
              <tbody>
                {signIns.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No sign-in records found
                    </td>
                  </tr>
                ) : (
                  signIns.map((signIn, index) => (
                    <tr key={index}>
                      <td>{signIn.TimeCreated}</td>
                      <td>{signIn.Username}</td>
                      <td>
                        <span className="badge badge-info">
                          {signIn.LogonType}
                        </span>
                      </td>
                      <td>{signIn.SourceIP}</td>
                      <td style={{ fontSize: '12px' }}>{signIn.ProcessName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'failed' && (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Username</th>
                  <th>Source IP</th>
                  <th>Failure Reason</th>
                </tr>
              </thead>
              <tbody>
                {signIns.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      No failed login records found
                    </td>
                  </tr>
                ) : (
                  signIns.map((signIn, index) => (
                    <tr key={index}>
                      <td>{signIn.TimeCreated}</td>
                      <td>{signIn.Username}</td>
                      <td>{signIn.SourceIP}</td>
                      <td>
                        <span className="badge badge-danger">
                          {signIn.FailureReason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'active' && (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Session Name</th>
                  <th>Session ID</th>
                  <th>State</th>
                  <th>Idle Time</th>
                  <th>Logon Time</th>
                </tr>
              </thead>
              <tbody>
                {signIns.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No active sessions found
                    </td>
                  </tr>
                ) : (
                  signIns.map((session, index) => (
                    <tr key={index}>
                      <td>{session.Username}</td>
                      <td>{session.SessionName}</td>
                      <td>{session.SessionID}</td>
                      <td>
                        <span className={`badge ${
                          session.State === 'Active' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {session.State}
                        </span>
                      </td>
                      <td>{session.IdleTime}</td>
                      <td>{session.LogonTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        Showing {signIns.length} {activeTab} records
      </div>
    </div>
  );
}

export default SignInHistory;
