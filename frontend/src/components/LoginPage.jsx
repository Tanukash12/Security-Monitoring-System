import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.is_suspicious) {
        alert('Suspicious login detected! Admin has been notified.');
      }
      
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" 
         style={{
           minHeight: '100vh',
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
         }}>
      <div className="card shadow-lg border-0" style={{maxWidth: '450px', width: '100%', margin: '20px'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                 style={{width: '80px', height: '80px'}}>
              <Shield size={40} className="text-primary" />
            </div>
            <h2 className="fw-bold mb-2">Security Login</h2>
            <p className="text-muted">Employee Monitoring System</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <AlertTriangle size={20} className="me-2" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-medium">Username</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>

          <div className="alert alert-info mt-4 mb-0">
            <small className="d-block text-center">
              <strong>Demo Credentials:</strong><br />
              Admin: <strong>admin</strong> / <strong>admin123</strong>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;