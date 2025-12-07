import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{sidebarStyles}</style>
      
      {/* Top Navbar */}
      <nav className="navbar navbar-dark bg-dark px-3 shadow-sm sticky-top">
        <div className="d-flex align-items-center">
          <button className="btn btn-outline-secondary me-3" onClick={toggleSidebar} title="Toggle Sidebar">
            <i className="bi bi-list"></i>
          </button>
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <i className="bi bi-shield-shaded fs-4 me-2"></i>
            <span className="fs-4">{panelTitle}</span>
          </Link>
        </div>
        <div className="d-flex align-items-center text-white">
          <i className="bi bi-person-circle fs-4 me-2"></i>
          <strong>{user?.name || 'User'}</strong>
          <button className="btn btn-link text-white text-decoration-none ms-2" onClick={handleLogout} title="Sign Out">
            <i className="bi bi-box-arrow-left fs-5"></i>
          </button>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Collapsible Sidebar */}
        {!isCollapsed && (
          <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', transition: 'width 0.2s ease-in-out' }}>
            <ul className="nav nav-pills flex-column mb-auto" id="dashboard-nav">
              {navItems}
            </ul>
            <hr />
            <div>
              <a href="#" className="nav-link text-white" onClick={handleLogout}>
                <i className="bi bi-box-arrow-left me-2"></i>
                <span>Sign Out</span>
              </a>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default DashboardLayout;