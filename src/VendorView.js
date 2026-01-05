import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import PromotionsPage from './dashboards/vendor/PromotionsPage';
import AnalyticsDashboard from './dashboards/vendor/AnalyticsDashboard';
import FeedbackPage from './dashboards/vendor/FeedbackPage';
import ManageProducts from './dashboards/vendor/ManageProducts';
import ManageQRConfig from './dashboards/vendor/ManageQRConfig';
import { useAuth } from './AuthContext';

const VendorView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUser = sessionStorage.getItem("systemUser") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.username) setUsername(parsedUser.username);
      } catch (error) {
        console.error("Error parsing user from session storage", error);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'manage-products':
        return <ManageProducts vendorId={user?.vendorId} key={user?.vendorId} />;
      case 'qr-config':
        return <ManageQRConfig vendorId={user?.vendorId} key={user?.vendorId} />;
      case 'manage-promotions':
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
        <a href="#" className={`nav-link text-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <i className="bi bi-speedometer2 me-2"></i>
          <span className="sidebar-text">Overview</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'manage-products' ? 'active' : ''}`} onClick={() => setActiveTab('manage-products')}>
          <i className="bi bi-box-seam me-2"></i>
          <span className="sidebar-text">Manage Products</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'qr-config' ? 'active' : ''}`} onClick={() => setActiveTab('qr-config')}>
          <i className="bi bi-sliders me-2"></i>
          <span className="sidebar-text">QR Configuration</span>
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
    <DashboardLayout panelTitle={`Vendor Panel${username ? ` - ${username}` : ''}`} navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default VendorView;