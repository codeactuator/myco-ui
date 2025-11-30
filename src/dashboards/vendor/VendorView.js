import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard'; // Assuming this is the correct path
import PromotionsPage from './PromotionsPage'; // Assuming this is the correct path
import FeedbackPage from './FeedbackPage'; // Assuming this is the correct path
import DashboardLayout from '../../DashboardLayout';

const VendorView = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'promotions':
        return <PromotionsPage />;
      case 'feedback':
        return <FeedbackPage />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  const navItems = (
    <>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <i className="bi bi-bar-chart-line-fill me-2"></i><span className="sidebar-text">Analytics</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => setActiveTab('promotions')}>
          <i className="bi bi-megaphone-fill me-2"></i><span className="sidebar-text">Promotions</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          <i className="bi bi-star-fill me-2"></i><span className="sidebar-text">Feedback & Ratings</span>
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