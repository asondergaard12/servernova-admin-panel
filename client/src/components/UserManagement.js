import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    description: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage(error.response?.data?.error || 'Failed to fetch users');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/users/create', newUser);

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
        setShowCreateModal(false);
        setNewUser({
          username: '',
          password: '',
          fullName: '',
          description: ''
        });
        fetchUsers();
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Failed to create user'
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (username, isEnabled) => {
    setMessage('');

    try {
      const response = await axios.post('/api/users/toggle-lock', {
        username,
        action: isEnabled ? 'lock' : 'unlock'
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
        fetchUsers();
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Failed to toggle user lock'
      );
      setMessageType('error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    setMessage('');

    try {
      const response = await axios.delete(`/api/users/${username}`);

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
        fetchUsers();
      }
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Failed to delete user'
      );
      setMessageType('error');
    }
  };

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h2>User Management</h2>

      {message && (
        <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <button
        onClick={() => setShowCreateModal(true)}
        className="btn btn-success"
      >
        Create New User
      </button>

      {loading && !users.length ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>Last Logon</th>
                <th>Password Last Set</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.Name}>
                    <td>{user.Name}</td>
                    <td>{user.FullName || '-'}</td>
                    <td>
                      {user.Enabled ? (
                        <span className="badge badge-success">Enabled</span>
                      ) : (
                        <span className="badge badge-danger">Disabled</span>
                      )}
                    </td>
                    <td>
                      {user.LastLogon
                        ? new Date(user.LastLogon).toLocaleString()
                        : 'Never'}
                    </td>
                    <td>
                      {user.PasswordLastSet
                        ? new Date(user.PasswordLastSet).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleLock(user.Name, user.Enabled)}
                          className={`btn btn-sm ${
                            user.Enabled ? 'btn-warning' : 'btn-success'
                          }`}
                        >
                          {user.Enabled ? 'Lock' : 'Unlock'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.Name)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="Enter username (3-20 characters)"
                  required
                  pattern="[a-zA-Z0-9_-]{3,20}"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  placeholder="Enter full name (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  value={newUser.description}
                  onChange={(e) =>
                    setNewUser({ ...newUser, description: e.target.value })
                  }
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
