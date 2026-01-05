import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../DashboardLayout';
import SupportDashboard from './SupportDashboard';
import SupportAnalytics from './SupportAnalytics';

const SupportView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUser = sessionStorage.getItem("systemUser") || sessionStorage.getItem("user");
    let foundName = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        foundName = parsedUser.username || parsedUser.name;
      } catch (error) {
        console.error("Error parsing user from session storage", error);
      }
    }

    if (!foundName) {
      const storedName = sessionStorage.getItem("userName");
      if (storedName && storedName !== "undefined") {
        foundName = storedName;
      }
    }

    if (foundName) setUsername(foundName);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SupportDashboard />;
      case 'analytics':
        return <SupportAnalytics />;
      default:
        return <SupportDashboard />;
    }
  };

  const navItems = (
    <>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <i className="bi bi-speedometer2 me-2"></i>
          <span className="sidebar-text">Dashboard</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <i className="bi bi-pie-chart-fill me-2"></i>
          <span className="sidebar-text">Support Analytics</span>
        </a>
      </li>
    </>
  );

  return (
    <DashboardLayout panelTitle={`Support Panel${username ? ` - ${username}` : ''}`} navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default SupportView;