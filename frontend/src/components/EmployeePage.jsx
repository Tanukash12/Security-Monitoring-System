import React, { useState } from 'react';
import { Shield, FileText, LogOut, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { fileAPI } from '../services/api';

const EmployeePage = ({ user, onLogout }) => {
  const [filePath, setFilePath] = useState('');
  const [accessResult, setAccessResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const commonFiles = [
    { path: '/documents/report.pdf', name: 'Report.pdf', safe: true },
    { path: '/shared/presentation.pptx', name: 'Presentation.pptx', safe: true },
    { path: '/confidential/salary_data.xlsx', name: 'Salary Data (Restricted)', safe: false },
    { path: '/admin/user_credentials.db', name: 'Admin Credentials (Restricted)', safe: false },
    { path: '/hr/employee_records.xlsx', name: 'Employee Records', safe: true },
  ];

  const handleFileAccess = async (path) => {
    setLoading(true);
    setAccessResult(null);

    try {
      const response = await fileAPI.requestAccess(path);
      setAccessResult({
        success: true,
        message: response.data.message,
        riskLevel: response.data.risk_level
      });
    } catch (error) {
      setAccessResult({
        success: false,
        message: error.response?.data?.message || 'Access denied',
        riskLevel: error.response?.data?.risk_level || 'high'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFileAccess = async (e) => {
    e.preventDefault();
    if (filePath.trim()) {
      await handleFileAccess(filePath);
    }
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8f9fa'}}>
      {/* Header */}
      <div className="bg-success text-white py-3 shadow-sm">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Shield size={32} />
              <div>
                <h4 className="mb-0">Employee Portal</h4>
                <small className="opacity-75">File Access Management</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <small className="d-block opacity-75">Welcome</small>
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

      <div className="container-fluid py-4">
        {/* Info Banner */}
        <div className="alert alert-info d-flex align-items-start mb-4">
          <AlertTriangle className="me-3 mt-1" size={24} />
          <div>
            <h6 className="alert-heading mb-2">Security Notice</h6>
            <p className="mb-0">
              All file access attempts are monitored and logged. Unauthorized access attempts will be reported to administrators.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* Common Files */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <FileText size={20} className="me-2" />
                  Common Files
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  {commonFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => handleFileAccess(file.path)}
                      disabled={loading}
                      className={`btn text-start p-3 ${
                        file.safe 
                          ? 'btn-outline-success' 
                          : 'btn-outline-danger'
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <FileText size={24} />
                          <div>
                            <div className="fw-semibold">{file.name}</div>
                            <small className="font-monospace text-muted">{file.path}</small>
                          </div>
                        </div>
                        {!file.safe && (
                          <AlertTriangle className="text-danger" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom File Access */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <FileText size={20} className="me-2" />
                  Custom File Access
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCustomFileAccess}>
                  <div className="mb-3">
                    <label htmlFor="filePath" className="form-label fw-medium">Enter File Path</label>
                    <input
                      type="text"
                      className="form-control form-control-lg font-monospace"
                      id="filePath"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      placeholder="/path/to/file.ext"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !filePath.trim()}
                    className="btn btn-success btn-lg w-100 fw-semibold"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Requesting Access...
                      </>
                    ) : 'Request Access'}
                  </button>
                </form>
              </div>
            </div>

            {/* Access Result */}
            {accessResult && (
              <div className={`card border-2 ${
                accessResult.success 
                  ? 'border-success' 
                  : 'border-danger'
              }`}>
                <div className={`card-body ${
                  accessResult.success ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                }`}>
                  <div className="d-flex align-items-start gap-3">
                    {accessResult.success ? (
                      <CheckCircle className="text-success mt-1" size={28} />
                    ) : (
                      <XCircle className="text-danger mt-1" size={28} />
                    )}
                    <div className="flex-grow-1">
                      <h5 className={accessResult.success ? 'text-success' : 'text-danger'}>
                        {accessResult.success ? 'Access Granted' : 'Access Denied'}
                      </h5>
                      <p className={`mb-3 ${accessResult.success ? 'text-success' : 'text-danger'}`}>
                        {accessResult.message}
                      </p>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <small className="fw-medium">Risk Level:</small>
                        <span className={`badge ${
                          accessResult.riskLevel === 'critical' ? 'bg-danger' :
                          accessResult.riskLevel === 'high' ? 'bg-warning text-dark' :
                          accessResult.riskLevel === 'medium' ? 'bg-info' :
                          'bg-success'
                        }`}>
                          {accessResult.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      {!accessResult.success && (
                        <div className="alert alert-danger mb-0">
                          <small className="d-flex align-items-center gap-2">
                            <AlertTriangle size={16} />
                            <strong>This attempt has been logged and reported to administrators</strong>
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Guidelines */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">Security Guidelines</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <CheckCircle className="text-success mt-1" size={24} />
                  <div>
                    <h6 className="mb-2">✓ Allowed Actions</h6>
                    <p className="text-muted mb-0">
                      Access files in /documents, /shared, /reports folders
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start gap-3">
                  <XCircle className="text-danger mt-1" size={24} />
                  <div>
                    <h6 className="mb-2">✗ Restricted Actions</h6>
                    <p className="text-muted mb-0">
                      Access files in /confidential, /admin, /hr/salary folders
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;