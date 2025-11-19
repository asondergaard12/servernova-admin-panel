import React, { useState } from 'react';
import axios from 'axios';

function ServerControl({ serverInfo }) {
  const [restartDelay, setRestartDelay] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRestart = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/server/restart', {
        delay: restartDelay
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Failed to restart server'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancelRestart = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/server/cancel-restart');

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
      } else {
        setMessage(response.data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Failed to cancel restart'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Server Control</h2>

      {message && (
        <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="delay">Restart Delay (seconds):</label>
        <input
          type="number"
          id="delay"
          value={restartDelay}
          onChange={(e) => setRestartDelay(Number(e.target.value))}
          min="10"
          max="600"
          disabled={loading}
        />
        <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          Time before server restarts (10-600 seconds)
        </small>
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-danger"
        disabled={loading || !serverInfo?.isAdmin}
      >
        Restart Server
      </button>

      <button
        onClick={handleCancelRestart}
        className="btn btn-warning"
        disabled={loading || !serverInfo?.isAdmin}
      >
        Cancel Pending Restart
      </button>

      {!serverInfo?.isAdmin && (
        <div className="warning-box" style={{ marginTop: '15px' }}>
          Administrator privileges required to restart the server
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Server Restart</h3>
            <p>
              Are you sure you want to restart the server?
              <br />
              <br />
              The server will restart in <strong>{restartDelay} seconds</strong>.
              <br />
              <br />
              <strong>This action cannot be undone!</strong>
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRestart}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'Restarting...' : 'Confirm Restart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerControl;
