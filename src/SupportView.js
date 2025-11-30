import React, { useState } from 'react';
import SupportDashboard from './dashboards/support/SupportDashboard';
import DashboardLayout from './DashboardLayout';

const SupportView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SupportDashboard />;
      // Add other support components here if needed
      default:
        return <SupportDashboard />;
    }
  };

  const navItems = (
    <li className="nav-item">
      <a href="#" className={`nav-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
        <i className="bi bi-headset me-2"></i><span className="sidebar-text">Support Dashboard</span>
      </a>
    </li>
  );

  return (
    <DashboardLayout panelTitle="Support Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default SupportView;