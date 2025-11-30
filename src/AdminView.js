import React, { useState } from 'react';
import QRCodeGenerator from './dashboards/vendor/QRCodeGenerator';
import DashboardLayout from './DashboardLayout';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('qr-generator');

  const renderContent = () => {
    switch (activeTab) {
      case 'qr-generator':
        return <QRCodeGenerator />;
      // Add other admin tabs here in the future
      default:
        return <QRCodeGenerator />;
    }
  };

  const navItems = (
    <li className="nav-item">
      <a href="#" className={`nav-link text-white ${activeTab === 'qr-generator' ? 'active' : ''}`} onClick={() => setActiveTab('qr-generator')}>
        <i className="bi bi-qr-code me-2"></i><span className="sidebar-text">QR Generation</span>
      </a>
    </li>
  );

  return (
    <DashboardLayout panelTitle="Admin Panel" navItems={navItems}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminView;