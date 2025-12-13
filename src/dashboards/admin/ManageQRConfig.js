import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { initialVendors } from './mockData';


// In a real app, this config would be fetched from and saved to a database.
const initialQrConfigs = {
  default: {
    size: 128,
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    rounded: false,
  },
  products: {
    'P01': { size: 128, fgColor: '#8B4513', bgColor: '#F5F5DC', rounded: true }, // Brown on Beige for Leather Wallet
  },
};

const ManageQRConfig = () => {
  const [configs, setConfigs] = useState(initialQrConfigs);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [activeTab, setActiveTab] = useState('default');

  const handleDefaultChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setConfigs(prev => ({ ...prev, default: { ...prev.default, [name]: val } }));
  };

  const handleProductConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setConfigs(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [selectedProductId]: {
          ...prev.products[selectedProductId] || prev.default,
          [name]: val,
        },
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would make an API call to save the configs.
    console.log('Saving configs:', configs);
    toast.success('Configuration saved successfully!');
  };

  const availableProducts = selectedVendorId ? initialVendors.find(v => v.id === selectedVendorId)?.products : [];
  const currentProductConfig = configs.products[selectedProductId] || configs.default;

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">QR Code Configuration</h4>
        <button className="btn btn-success" onClick={handleSave}><i className="bi bi-check-lg me-2"></i>Save All Configurations</button>
      </div>

      <div className="card-header bg-light border-bottom-0 pt-3">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'default' ? 'active' : ''}`} onClick={() => setActiveTab('default')}>Default Settings</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'vendor' ? 'active' : ''}`} onClick={() => setActiveTab('vendor')}>Vendor Overrides</button>
          </li>
        </ul>
      </div>

      {activeTab === 'default' && (
        <div className="card-body fade-in">
          <h5>Default Settings</h5>
          <p className="text-muted">These settings apply to all QR codes unless overridden by a product-specific rule.</p>
          <div className="row">
            <div className="col-md-3 mb-3"><label className="form-label">Size (px)</label><input type="number" name="size" value={configs.default.size} onChange={handleDefaultChange} className="form-control" /></div>
            <div className="col-md-3 mb-3"><label className="form-label">Foreground Color</label><input type="color" name="fgColor" value={configs.default.fgColor} onChange={handleDefaultChange} className="form-control form-control-color" /></div>
            <div className="col-md-3 mb-3"><label className="form-label">Background Color</label><input type="color" name="bgColor" value={configs.default.bgColor} onChange={handleDefaultChange} className="form-control form-control-color" /></div>
            <div className="col-md-3 mb-3 d-flex align-items-end">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="defaultRoundedSwitch" name="rounded" checked={configs.default.rounded} onChange={handleDefaultChange} />
                <label className="form-check-label" htmlFor="defaultRoundedSwitch">Rounded Corners</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vendor' && (
        <div className="card-body fade-in">
          <h5>Product-Specific Overrides</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">1. Select Vendor</label>
              <select className="form-select" value={selectedVendorId} onChange={e => { setSelectedVendorId(e.target.value); setSelectedProductId(''); }}>
                <option value="">-- Choose a Vendor --</option>
                {initialVendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">2. Select Product</label>
              <select className="form-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={!selectedVendorId}>
                <option value="">{selectedVendorId ? '-- Choose a Product --' : 'Select a vendor first'}</option>
                {availableProducts?.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </div>
          </div>

          {selectedProductId && (
            <div className="mt-3 p-3 bg-light rounded">
              <h6>Configuration for "{availableProducts.find(p => p.id === selectedProductId)?.name}"</h6>
              <div className="row">
                <div className="col-md-3 mb-3"><label className="form-label">Size (px)</label><input type="number" name="size" value={currentProductConfig.size} onChange={handleProductConfigChange} className="form-control" /></div>
                <div className="col-md-3 mb-3"><label className="form-label">Foreground Color</label><input type="color" name="fgColor" value={currentProductConfig.fgColor} onChange={handleProductConfigChange} className="form-control form-control-color" /></div>
                <div className="col-md-3 mb-3"><label className="form-label">Background Color</label><input type="color" name="bgColor" value={currentProductConfig.bgColor} onChange={handleProductConfigChange} className="form-control form-control-color" /></div>
                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="productRoundedSwitch" name="rounded" checked={currentProductConfig.rounded} onChange={handleProductConfigChange} />
                    <label className="form-check-label" htmlFor="productRoundedSwitch">Rounded Corners</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageQRConfig;