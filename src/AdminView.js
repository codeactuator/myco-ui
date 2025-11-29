import React, { useState } from 'react';
import ManageVendors from './dashboards/admin/ManageVendors';
import GenerateQRCodes from './dashboards/admin/GenerateQRCodes';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('vendors');

  const renderContent = () => {
    switch (activeTab) {
      case 'vendors':
        return <ManageVendors />;
      case 'qrcodes':
        return <GenerateQRCodes />;
      default:
        return <ManageVendors />;
    }
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
            <i className="bi bi-people-fill me-2"></i>Manage Vendors
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'qrcodes' ? 'active' : ''}`} onClick={() => setActiveTab('qrcodes')}>
            <i className="bi bi-qr-code me-2"></i>QR Code Generation
          </button>
        </li>
      </ul>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminView;