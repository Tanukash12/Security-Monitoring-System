import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Activity, FileWarning, Clock, MapPin, Monitor, LogOut } from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [fileAccess, setFileAccess] = useState([]);
  const [riskUsers, setRiskUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, attemptsRes, filesRes, riskRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getLoginAttempts(),
        adminAPI.getFileAccess(),
        adminAPI.getRiskUsers()
      ]);

      setStats(dashboardRes.data.stats);
      setLoginAttempts(attemptsRes.data.attempts);
      setFileAccess(filesRes.data.accesses);
      setRiskUsers(riskRes.data.risk_users);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const handleSuspendUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to suspend ${username}?`)) {
      try {
        await adminAPI.suspendUser(userId);
        alert('User suspended successfully');
        loadDashboardData();
      } catch (error) {
        alert('Failed to suspend user');
      }
    }
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'success': return 'badge bg-success';
      case 'failed': return 'badge bg-danger';
      case 'suspicious': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  };

  const getRiskBadge = (risk) => {
    switch(risk) {
      case 'critical': return 'badge bg-danger';
      case 'high': return 'badge bg-warning text-dark';
      case 'medium': return 'badge bg-info';
      default: return 'badge bg-success';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      {/* Header */}
      <div className="bg-primary text-white py-3 shadow-sm">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Shield size={32} />
              <div>
                <h4 className="mb-0">Security Monitoring System</h4>
                <small className="opacity-75">Admin Dashboard - Real-time Monitoring</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <small className="d-block opacity-75">Logged in as</small>
                <strong>{user.username}</strong>
              </div>
              <button onClick={onLogout} className="btn btn-light btn-sm">
                <LogOut size={16} className="me-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-bottom">
        <div className="container-fluid">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Activity size={18} className="me-2" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'logins' ? 'active' : ''}`}
                onClick={() => setActiveTab('logins')}
              >
                <Users size={18} className="me-2" />
                Login Attempts
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <FileWarning size={18} className="me-2" />
                File Access
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'risks' ? 'active' : ''}`}
                onClick={() => setActiveTab('risks')}
              >
                <AlertTriangle size={18} className="me-2" />
                Risk Users
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-fluid py-4">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Total Users</small>
                        <h3 className="mb-0 mt-1">{stats.total_users || 0}</h3>
                      </div>
                      <Users className="text-primary" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Active Users</small>
                        <h3 className="mb-0 mt-1 text-success">{stats.active_users || 0}</h3>
                      </div>
                      <Activity className="text-success" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Today's Logins</small>
                        <h3 className="mb-0 mt-1 text-primary">{stats.today_logins || 0}</h3>
                      </div>
                      <Shield className="text-primary" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Failed Logins</small>
                        <h3 className="mb-0 mt-1 text-danger">{stats.failed_logins || 0}</h3>
                      </div>
                      <AlertTriangle className="text-danger" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Blocked Files</small>
                        <h3 className="mb-0 mt-1 text-warning">{stats.blocked_files || 0}</h3>
                      </div>
                      <FileWarning className="text-warning" size={32} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-2">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Risk Users</small>
                        <h3 className="mb-0 mt-1 text-danger">{stats.risk_users || 0}</h3>
                      </div>
                      <AlertTriangle className="text-danger" size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row g-3">
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">
                      <AlertTriangle className="text-danger me-2" size={20} />
                      Recent Failed Logins
                    </h5>
                  </div>
                  <div className="card-body">
                    {loginAttempts.filter(a => a.status === 'failed').slice(0, 5).map(attempt => (
                      <div key={attempt.id} className="alert alert-danger py-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{attempt.username}</strong>
                            <br />
                            <small>{attempt.ip_address} • {formatTimestamp(attempt.timestamp)}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loginAttempts.filter(a => a.status === 'failed').length === 0 && (
                      <p className="text-muted text-center mb-0">No failed login attempts</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">
                      <FileWarning className="text-warning me-2" size={20} />
                      Blocked File Access
                    </h5>
                  </div>
                  <div className="card-body">
                    {fileAccess.filter(f => !f.is_authorized).slice(0, 5).map(file => (
                      <div key={file.id} className="alert alert-warning py-2 mb-2">
                        <strong>{file.username}</strong>
                        <br />
                        <small className="font-monospace">{file.file_path}</small>
                        <br />
                        <small className="text-muted">{formatTimestamp(file.timestamp)}</small>
                      </div>
                    ))}
                    {fileAccess.filter(f => !f.is_authorized).length === 0 && (
                      <p className="text-muted text-center mb-0">No blocked file access</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Attempts Tab */}
        {activeTab === 'logins' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                All Login Attempts ({loginAttempts.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>IP Address</th>
                      <th>Device</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginAttempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td><strong>{attempt.username}</strong></td>
                        <td>
                          <span className={getBadgeClass(attempt.status)}>
                            {attempt.status}
                            {attempt.is_suspicious && ' ⚠️'}
                          </span>
                        </td>
                        <td>
                          <Clock size={14} className="me-1" />
                          {formatTimestamp(attempt.timestamp)}
                        </td>
                        <td><small>{attempt.ip_address}</small></td>
                        <td>
                          <Monitor size={14} className="me-1" />
                          <small>{attempt.device_info.substring(0, 30)}...</small>
                        </td>
                        <td>
                          <MapPin size={14} className="me-1" />
                          {attempt.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* File Access Tab */}
        {activeTab === 'files' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <FileWarning size={20} className="me-2" />
                File Access Logs ({fileAccess.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>File Path</th>
                      <th>Action</th>
                      <th>Time</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileAccess.map(access => (
                      <tr key={access.id}>
                        <td><strong>{access.username}</strong></td>
                        <td><code className="small">{access.file_path}</code></td>
                        <td>
                          <span className={access.action === 'allowed' ? 'badge bg-success' : 'badge bg-danger'}>
                            {access.action}
                          </span>
                        </td>
                        <td>{formatTimestamp(access.timestamp)}</td>
                        <td>
                          <span className={getRiskBadge(access.risk_level)}>
                            {access.risk_level.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Risk Users Tab */}
        {activeTab === 'risks' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <AlertTriangle size={20} className="me-2" />
                Risk Users Dashboard ({riskUsers.length})
              </h5>
            </div>
            <div className="card-body">
              {riskUsers.map(user => (
                <div key={user.id} className="card mb-3 border">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-3 align-items-center">
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold`}
                          style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: user.status === 'critical' ? '#dc3545' : 
                                           user.status === 'high' ? '#fd7e14' : '#ffc107'
                          }}
                        >
                          {user.risk_score}
                        </div>
                        <div><h5 className="mb-1">
                                {user.username}
                                {user.anomaly_detected && (
                                  <span className="badge bg-dark ms-2">ML Anomaly</span>
                                )}
                              </h5>

                          
                          <small className="text-muted">{user.email}</small>
                          <p className="mb-0 mt-1">
                            <small>
                              {user.reasons}
                              {user.anomaly_detected && ' | Behavioral anomaly detected by ML model'}
                            </small>
                          </p>

                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <span className={`badge ${
                          user.status === 'critical' ? 'bg-danger' :
                          user.status === 'high' ? 'bg-warning text-dark' :
                          'bg-info'
                        }`}>
                          {user.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleSuspendUser(user.id, user.username)}
                          className="btn btn-danger btn-sm"
                        >
                          Suspend User
                        </button>
                      </div>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div
                        className={`progress-bar ${
                          user.status === 'critical' ? 'bg-danger' :
                          user.status === 'high' ? 'bg-warning' : 'bg-info'
                        }`}
                        style={{width: `${user.risk_score}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {riskUsers.length === 0 && (
                <p className="text-muted text-center py-4 mb-0">No risk users detected</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;