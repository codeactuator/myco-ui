import React, { useState } from 'react';

const mockVendors = [
  { id: 'V001', name: 'Premium Bags Co.' },
  { id: 'V002', name: 'City Wallets Inc.' },
];

const GenerateQRCodes = () => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [lastBatch, setLastBatch] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!selectedVendor || quantity <= 0) {
      alert('Please select a vendor and enter a valid quantity.');
      return;
    }
    const batchId = `BATCH-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`;
    const vendorName = mockVendors.find(v => v.id === selectedVendor)?.name;
    setLastBatch({ vendorName, quantity, batchId });
    alert(`Successfully generated ${quantity} QR codes for ${vendorName}.`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header"><h4 className="mb-0">Generate QR Code Batch</h4></div>
      <div className="card-body">
        <form onSubmit={handleGenerate}>
          <div className="row align-items-end">
            <div className="col-md-5 mb-3">
              <label htmlFor="vendorSelect" className="form-label">Select Vendor</label>
              <select id="vendorSelect" className="form-select" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} required>
                <option value="">Choose a vendor...</option>
                {mockVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label htmlFor="quantity" className="form-label">Quantity</label>
              <input type="number" id="quantity" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
            </div>
            <div className="col-md-3 mb-3 d-grid">
              <button type="submit" className="btn btn-primary">Generate Batch</button>
            </div>
          </div>
        </form>
        {lastBatch && (
          <div className="alert alert-success mt-4">
            <strong>Last Batch Generated:</strong> ID: {lastBatch.batchId} | Vendor: {lastBatch.vendorName} | Quantity: {lastBatch.quantity}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQRCodes;