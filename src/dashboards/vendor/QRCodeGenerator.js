import React, { useState, useEffect } from 'react';

// Mock data - in a real app, this would come from an API
const mockVendors = {
  'V01': { name: 'Leather Goods Inc.', products: [{ id: 'P01', name: 'Premium Leather Wallet' }, { id: 'P03', name: 'Traveler\'s Passport Holder' }] },
  'V02': { name: 'Urban Gear Co.', products: [{ id: 'P02', name: 'City Explorer Backpack' }] },
};

const QRCodeGenerator = () => {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [confirmedProduct, setConfirmedProduct] = useState(null);

  useEffect(() => {
    if (selectedVendorId && mockVendors[selectedVendorId]) {
      const vendorProducts = mockVendors[selectedVendorId].products;
      // Filter products if an item code is typed
      const filtered = itemCode
        ? vendorProducts.filter(p => p.id.toLowerCase().includes(itemCode.toLowerCase()))
        : vendorProducts;
      setAvailableProducts(filtered);
    } else {
      setAvailableProducts([]);
    }
    setSelectedProductId('');
    setConfirmedProduct(null);
  }, [selectedVendorId, itemCode]);

  useEffect(() => {
    // When an item is selected from the dropdown, update the itemCode input field
    if (selectedProductId) {
      setItemCode(selectedProductId);
    }
  }, [selectedProductId]);

  const handleGenerate = () => {
    // The product to confirm can be from the dropdown or what's typed in the item code field
    const product = availableProducts.find(p => p.id === itemCode);
    if (product) {
      // In a real app, you would now make an API call to your server
      // with the product details (e.g., product.id) to generate the QR code.
      setConfirmedProduct(product);
    } else {
      alert('Please select a product first.');
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Generate QR Code Batch</h4>
        <div className="row align-items-end">
          <div className="col-md-4 mb-3">
            <label htmlFor="vendor-select" className="form-label">Vendor</label>
            <select
              id="vendor-select"
              className="form-select"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
            >
              <option value="">Select a vendor</option>
              {Object.entries(mockVendors).map(([id, vendor]) => (
                <option key={id} value={id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="item-code-input" className="form-label">Item Code</label>
            <input
              type="text"
              id="item-code-input"
              className="form-control"
              placeholder="Type to filter..."
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
                setSelectedProductId(''); // Clear dropdown selection when typing
              }}
              disabled={!selectedVendorId}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="product-select" className="form-label">Item</label>
            <select
              id="product-select"
              className="form-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value) }
              disabled={!selectedVendorId}
            >
              <option value="">
                {selectedVendorId ? 'Select an item' : 'Select vendor first'}
              </option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="col-md-2 mb-3">
            <button className="btn btn-primary" onClick={handleGenerate} disabled={!itemCode}>
              Confirm Selection
            </button>
          </div>
        </div>

        {confirmedProduct && (
          <div className="mt-4 text-center">
            <h6>Product Selected:</h6>
            <p className="lead">{confirmedProduct.name} ({confirmedProduct.id})</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;