import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';
import { QRCodeCanvas } from 'qrcode.react';

const ManageQRConfig = () => {
  const [configs, setConfigs] = useState({
    default: { size: 128, fgColor: '#000000', bgColor: '#FFFFFF', rounded: false },
    products: {}
  });
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [activeTab, setActiveTab] = useState('default');
  const lastRequestedVendorId = useRef(null);

  useEffect(() => {
    fetchConfigs();
    fetchVendors();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/qr-configs`);
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error("Error fetching QR configs:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/vendors`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchProductsByVendor = async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/products/vendor/${vendorId}`);
      if (res.ok) {
        const data = await res.json();
        if (lastRequestedVendorId.current === vendorId) {
          setProducts(data);
        }
      } else {
        if (lastRequestedVendorId.current === vendorId) setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (lastRequestedVendorId.current === vendorId) setProducts([]);
    }
  };

  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);
    setSelectedProductId('');
    lastRequestedVendorId.current = vendorId;
    if (vendorId) {
      fetchProductsByVendor(vendorId);
    } else {
      setProducts([]);
    }
  };

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

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/qr-configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs),
      });
      if (res.ok) {
        toast.success('Configuration saved successfully!');
      } else {
        toast.error('Failed to save configuration.');
      }
    } catch (error) {
      toast.error('Error saving configuration.');
    }
  };

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
            <div className="col-lg-8">
              <div className="row">
                <div className="col-md-6 mb-3"><label className="form-label">Size (px)</label><input type="number" name="size" value={configs.default.size} onChange={handleDefaultChange} className="form-control" /></div>
                <div className="col-md-6 mb-3 d-flex align-items-end">
                  <div className="form-check form-switch mb-2">
                    <input className="form-check-input" type="checkbox" role="switch" id="defaultRoundedSwitch" name="rounded" checked={configs.default.rounded} onChange={handleDefaultChange} />
                    <label className="form-check-label" htmlFor="defaultRoundedSwitch">Rounded Corners</label>
                  </div>
                </div>
                <div className="col-md-6 mb-3"><label className="form-label">Foreground Color</label><input type="color" name="fgColor" value={configs.default.fgColor} onChange={handleDefaultChange} className="form-control form-control-color w-100" /></div>
                <div className="col-md-6 mb-3"><label className="form-label">Background Color</label><input type="color" name="bgColor" value={configs.default.bgColor} onChange={handleDefaultChange} className="form-control form-control-color w-100" /></div>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <label className="form-label mb-3">Preview</label>
              <div className="p-3 border rounded bg-light d-inline-block">
                <QRCodeCanvas value="Default QR Config" size={120} fgColor={configs.default.fgColor} bgColor={configs.default.bgColor} />
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
              <select className="form-select" value={selectedVendorId} onChange={handleVendorChange}>
                <option value="">-- Choose a Vendor --</option>
                {vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">2. Select Product</label>
              <select className="form-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={!selectedVendorId}>
                <option value="">{selectedVendorId ? '-- Choose a Product --' : 'Select a vendor first'}</option>
                {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </div>
          </div>

          {selectedProductId && (
            <div className="mt-3 p-3 bg-light rounded">
              <h6>Configuration for "{products.find(p => p.id === selectedProductId)?.name}"</h6>
              <div className="row">
                <div className="col-lg-8">
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Size (px)</label><input type="number" name="size" value={currentProductConfig.size} onChange={handleProductConfigChange} className="form-control" /></div>
                    <div className="col-md-6 mb-3 d-flex align-items-end">
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="productRoundedSwitch" name="rounded" checked={currentProductConfig.rounded} onChange={handleProductConfigChange} />
                        <label className="form-check-label" htmlFor="productRoundedSwitch">Rounded Corners</label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3"><label className="form-label">Foreground Color</label><input type="color" name="fgColor" value={currentProductConfig.fgColor} onChange={handleProductConfigChange} className="form-control form-control-color w-100" /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Background Color</label><input type="color" name="bgColor" value={currentProductConfig.bgColor} onChange={handleProductConfigChange} className="form-control form-control-color w-100" /></div>
                  </div>
                </div>
                <div className="col-lg-4 text-center">
                  <label className="form-label mb-3">Preview</label>
                  <div className="p-3 border rounded bg-white d-inline-block">
                    <QRCodeCanvas value={`Product: ${selectedProductId}`} size={120} fgColor={currentProductConfig.fgColor} bgColor={currentProductConfig.bgColor} />
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