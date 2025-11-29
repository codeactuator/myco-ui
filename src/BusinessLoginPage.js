import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const BusinessLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ minWidth: '350px' }}>
        <h3 className="text-center mb-4">Business Portal</h3>
        <p className="text-center text-muted">Select a role to log in:</p>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" onClick={() => handleLogin('admin')}>Login as Admin</button>
          <button className="btn btn-info text-white" onClick={() => handleLogin('vendor')}>Login as Vendor</button>
          <button className="btn btn-secondary" onClick={() => handleLogin('support')}>Login as Support</button>
        </div>
      </div>
    </div>
  );
};

export default BusinessLoginPage;