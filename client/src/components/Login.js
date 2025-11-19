import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        accessCode: accessCode
      });

      if (response.data.success) {
        onLogin();
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>ServerNova Admin Panel</h1>
        <p>Enter your access code to continue</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accessCode">Access Code</label>
            <input
              type="password"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !accessCode}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
