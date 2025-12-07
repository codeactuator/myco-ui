import React, { useState } from 'react';
import DashboardLayout from '../../DashboardLayout';
import SupportDashboard from './SupportDashboard';
import SupportAnalytics from './SupportAnalytics';

const SupportView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <DashboardLayout panelTitle="Support Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default SupportView;