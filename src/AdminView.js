import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import ManageVendors from './dashboards/admin/ManageVendors';
import ManageOrders from './dashboards/admin/ManageOrders';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('manage-orders');

  const renderContent = () => {
    switch (activeTab) {
      case 'manage-vendors':
        return <ManageVendors />;
      case 'manage-orders':
        return <ManageOrders />;
      default:
        return <ManageOrders />;
    }
  };

  const navItems = (
    <>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'manage-vendors' ? 'active' : ''}`} onClick={() => setActiveTab('manage-vendors')}>
          <i className="bi bi-people-fill me-2"></i>
          <span className="sidebar-text">Manage Vendors</span>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'manage-orders' ? 'active' : ''}`} onClick={() => setActiveTab('manage-orders')}>
          <i className="bi bi-box-seam-fill me-2"></i>
          <span className="sidebar-text">Manage Orders</span>
        </a>
      </li>
    </>
  );

  return (
    <DashboardLayout panelTitle="Admin Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminView;