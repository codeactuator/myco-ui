import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

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

const UserLayout = ({ children, pageTitle, hideNav = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Initialize state directly from sessionStorage to avoid delay/missing data on mount
  const [userInfo, setUserInfo] = useState(() => {
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const userMobile = sessionStorage.getItem("userMobile");
    return userId ? { name: userName || 'User', mobileNumber: userMobile } : null;
  });
  
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

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      fetch(`${API_BASE_URL}/v1/users/id/${userId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch user info");
        })
        .then((data) => {
          setUserInfo({ name: data.name || 'User', mobileNumber: data.mobileNumber });
          sessionStorage.setItem("userName", data.name || "User");
          sessionStorage.setItem("userMobile", data.mobileNumber);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Navigation */}
      {!hideNav && (
      <nav className="d-flex flex-column flex-shrink-0 bg-dark text-white" style={{ width: isCollapsed ? '0' : '220px', transition: 'width 0.2s ease-in-out', overflow: 'hidden' }}>
        <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
          <li className="nav-item">
            <NavLink to="/home" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="Home">
              <i className={`bi bi-house-door-fill fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Home</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/add-contact" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="Add Contact">
              <i className={`bi bi-person-plus-fill fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Add Contact</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/np" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="Notifications">
              <i className={`bi bi-activity fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>Activity</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/user-details" style={({ isActive }) => ({ ...(isCollapsed ? collapsedNavLinkStyles : navLinkStyles), ...(isActive ? activeLinkStyles : {}) })} title="User Details">
              <i className={`bi bi-person-circle fs-4 ${!isCollapsed ? 'me-3' : ''}`}></i>
              {!isCollapsed && <span>User Details</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Navigation */}
        <header className="navbar navbar-light bg-light px-3 shadow-sm sticky-top border-bottom">
          <div className="d-flex align-items-center">
            {!hideNav && (
            <button className="btn btn-outline-secondary me-3" onClick={toggleLeftNav} title="Toggle Navigation">
              <i className="bi bi-list"></i>
            </button>
            )}
            <h4 className="mb-0">{pageTitle}</h4>
          </div>
          <div className="d-flex align-items-center">
            {!hideNav && userInfo && (
              <div className="me-3 text-end" style={{ lineHeight: '1.2' }}>
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{userInfo.name}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{userInfo.mobileNumber}</div>
              </div>
            )}
            {!hideNav && (
            <button className="btn btn-link text-danger" onClick={handleLogout} title="Logout">
              <i className="bi bi-box-arrow-right fs-4"></i>
            </button>
            )}
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