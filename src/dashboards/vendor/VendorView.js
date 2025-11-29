import React, { useState } from 'react';
import AnalyticsDashboard from './vendor/AnalyticsDashboard';
import PromotionsPage from './vendor/PromotionsPage';
import FeedbackPage from './vendor/FeedbackPage';

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

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <i className="bi bi-bar-chart-line-fill me-2"></i>Analytics
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => setActiveTab('promotions')}>
            <i className="bi bi-megaphone-fill me-2"></i>Promotions
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
            <i className="bi bi-star-fill me-2"></i>Feedback & Ratings
          </button>
        </li>
      </ul>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default VendorView;