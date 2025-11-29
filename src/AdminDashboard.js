import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AdminView from './AdminView';
import VendorView from './VendorView';
import SupportView from './SupportView';
import './Dashboard.css'; // Import the new CSS

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-header-text">myco</span>
        </div>
        <ul className="sidebar-nav">
          {/* Admin sees all links */}
          {user?.role === 'ADMIN' && (
            <>
              <li><NavLink to="/dashboard" end className="nav-link"><i className="bi bi-house-door-fill me-3"></i><span className="nav-link-text">Admin Home</span></NavLink></li>
              <li><NavLink to="/dashboard/vendor" className="nav-link"><i className="bi bi-shop me-3"></i><span className="nav-link-text">Vendor View</span></NavLink></li>
              <li><NavLink to="/dashboard/support" className="nav-link"><i className="bi bi-headset me-3"></i><span className="nav-link-text">Support View</span></NavLink></li>
            </>
          )}
          {/* Vendor only sees their link */}
          {user?.role === 'VENDOR' && (
            <li><NavLink to="/dashboard" className="nav-link"><i className="bi bi-shop me-3"></i><span className="nav-link-text">Vendor Dashboard</span></NavLink></li>
          )}
          {/* Support only sees their link */}
          {user?.role === 'SUPPORT' && (
            <li><NavLink to="/dashboard" className="nav-link"><i className="bi bi-headset me-3"></i><span className="nav-link-text">Support Dashboard</span></NavLink></li>
          )}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button className="sidebar-toggle me-3" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            {user && <span className="text-muted">Logged in as: <strong>{user.name}</strong> ({user.role})</span>}
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/home')}>Consumer App</button>
            <button className="btn btn-danger" onClick={() => {
              logout();
              navigate('/business-login');
            }}>Logout</button>
          </div>
        </header>

        {/* Nested Routes for the content */}
        <div className="mt-4">
          <Routes>
            {user?.role === 'ADMIN' && (
              <>
                <Route index element={<AdminView />} />
                <Route path="vendor" element={<VendorView />} />
                <Route path="support/*" element={<SupportView />} />
              </>
            )}
            
            {user?.role === 'VENDOR' && <Route index element={<VendorView />} />}
            {user?.role === 'SUPPORT' && <Route path="/*" element={<SupportView />} />}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;