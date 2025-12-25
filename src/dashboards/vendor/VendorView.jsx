import React, { useState } from 'react';
import DashboardLayout from '../../DashboardLayout';
import ManagePromotions from './ManagePromotions';
import AnalyticsDashboard from './AnalyticsDashboard';
import FeedbackPage from './FeedbackPage';

const VendorView = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'manage-promotions':
        return <ManagePromotions />;
      case 'feedback':
        return <FeedbackPage />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  const navItems = (
    <>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <i className="bi bi-speedometer2 me-2"></i>
          <span className="sidebar-text">Overview</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'manage-promotions' ? 'active' : ''}`} onClick={() => setActiveTab('manage-promotions')}>
          <i className="bi bi-tags-fill me-2"></i>
          <span className="sidebar-text">Manage Promotions</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          <i className="bi bi-star-fill me-2"></i>
          <span className="sidebar-text">Feedback & Ratings</span>
        </a>
      </li>
    </>
  );

  return (
    <DashboardLayout panelTitle="Vendor Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default VendorView;