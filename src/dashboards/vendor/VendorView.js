import React, { useState } from 'react';
import DashboardLayout from '../../DashboardLayout';
import ManagePromotions from './ManagePromotions';

const VendorView = () => {
  const [activeTab, setActiveTab] = useState('manage-promotions');

  const renderContent = () => {
    switch (activeTab) {
      case 'manage-promotions':
        return <ManagePromotions />;
      default:
        return <div className="p-4"><h3>Welcome to Vendor Dashboard</h3><p>Select an option from the menu.</p></div>;
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
    </>
  );

  return (
    <DashboardLayout panelTitle="Vendor Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default VendorView;