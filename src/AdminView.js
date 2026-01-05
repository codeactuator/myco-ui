import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import ManageVendors from './dashboards/admin/ManageVendors';
import ManageOrders from './dashboards/admin/ManageOrders';
import ManageUsers from './dashboards/admin/ManageUsers';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('manage-orders');
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
      case 'manage-vendors':
        return <ManageVendors />;
      case 'manage-users':
        return <ManageUsers />;
      case 'manage-orders':
        return <ManageOrders />;
      default:
        return <ManageOrders />;
    }
  };

  const navItems = (
    <>
      <li className="nav-item">
        <a href="#" className={`nav-link text-white ${activeTab === 'manage-users' ? 'active' : ''}`} onClick={() => setActiveTab('manage-users')}>
          <i className="bi bi-people me-2"></i>
          <span className="sidebar-text">Manage Users</span>
        </a>
      </li>
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
    <DashboardLayout panelTitle={`Admin Panel${username ? ` - ${username}` : ''}`} navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminView;