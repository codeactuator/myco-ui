import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navLinkStyles = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  color: '#adb5bd',
  textDecoration: 'none',
  transition: 'background-color 0.2s, color 0.2s',
  whiteSpace: 'nowrap',
};

const activeLinkStyles = {
  color: '#fff',
  backgroundColor: '#0d6efd', // Bootstrap primary color
};

const UserLayout = ({ children, pageTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();

  const toggleLeftNav = () => setIsCollapsed(!isCollapsed);

  const collapsedNavLinkStyles = {
    ...navLinkStyles,
    justifyContent: 'center',
    padding: '1rem 0',
  };

  // This would come from auth context in a real app
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/signup');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Navigation */}
      <nav className="d-flex flex-column flex-shrink-0 bg-dark text-white" style={{ width: isCollapsed ? '0' : '220px', transition: 'width 0.2s ease-in-out', overflow: 'hidden' }}>
        <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
          <li className="nav-item">
            <NavLink to="/home" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="Home">
              <i className={`bi bi-house-door-fill fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Home</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/qr" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="My QR Code">
              <i className={`bi bi-qr-code fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>My QR</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-products" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="My Products">
              <i className={`bi bi-box2-heart-fill fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Products</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/posts" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="My Posts">
              <i className={`bi bi-list-ul fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Posts</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/np" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="Notifications">
              <i className={`bi bi-bell-fill fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Alerts</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navigation */}
        <header className="navbar navbar-light bg-light px-3 shadow-sm sticky-top border-bottom">
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-secondary me-3" onClick={toggleLeftNav} title="Toggle Navigation">
              <i className="bi bi-list"></i>
            </button>
            <h4 className="mb-0">{pageTitle}</h4>
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-danger" onClick={handleLogout} title="Logout">
              <i className="bi bi-box-arrow-right fs-4"></i>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;