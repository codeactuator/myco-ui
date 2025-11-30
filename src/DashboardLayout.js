import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const sidebarStyles = `
  #dashboard-nav .nav-link {
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    border-radius: 0.375rem;
    font-weight: 500;
    padding: 0.75rem 1rem;
    color: #adb5bd;
    border-left: 3px solid transparent;
    white-space: nowrap; /* Prevent text wrapping */
  }

  #dashboard-nav .nav-link:hover {
    background-color: #343a40;
    color: #fff;
  }

  #dashboard-nav .nav-link.active {
    background-color: #343a40;
    color: #fff;
    font-weight: 600;
    border-left: 3px solid #0d6efd;
  }

  .sidebar-collapsed .nav-link .sidebar-text,
  .sidebar-collapsed .panel-title-text,
  .sidebar-collapsed .user-name-text {
    display: none;
  }
`;

const DashboardLayout = ({ panelTitle, navItems, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    logout();
    navigate('/business-login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <style>{sidebarStyles}</style>
      <div 
        className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${isCollapsed ? 'sidebar-collapsed' : ''}`} 
        style={{ width: isCollapsed ? '80px' : '280px', transition: 'width 0.2s ease-in-out' }}
      >
        <div className="d-flex align-items-center mb-3 mb-md-0">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none">
            <i className="bi bi-shield-shaded fs-4 me-2"></i>
            <span className="fs-4 panel-title-text">{panelTitle}</span>
          </a>
          <button 
            className="btn btn-outline-secondary ms-auto" 
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto" id="dashboard-nav">
          {navItems}
          <li className="nav-item mt-auto">
            <a href="#" className="nav-link text-white" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left me-2"></i>
              <span className="sidebar-text">Sign Out</span>
            </a>
          </li>
        </ul>
        <hr />
        <div className="d-flex align-items-center">
           <a href="#" className="d-flex align-items-center text-white text-decoration-none">
             <i className="bi bi-person-circle fs-4 me-2"></i>
             <strong className="user-name-text">{user?.name || 'User'}</strong>
           </a>
        </div>
      </div>

      <div className="flex-grow-1 p-4 bg-light">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;