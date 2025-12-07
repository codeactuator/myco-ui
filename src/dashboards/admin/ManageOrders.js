import React, { useState, useEffect } from 'react';

// Mock data - in a real app, this would come from an API
const mockVendors = {
  'V001': { name: 'Premium Bags Co.', products: [{ id: 'P01', name: 'Premium Leather Wallet' }, { id: 'P03', name: 'Traveler\'s Passport Holder' }] },
  'V002': { name: 'City Wallets Inc.', products: [{ id: 'P02', name: 'City Explorer Backpack' }] },
  'V003': { name: 'Urban Gear Co.', products: [{ id: 'P04', name: 'Canvas Messenger Bag' }] },
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ vendorId: '', productId: '', quantity: 100 });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (newOrder.vendorId && mockVendors[newOrder.vendorId]) {
      setAvailableProducts(mockVendors[newOrder.vendorId].products);
      setNewOrder(prev => ({ ...prev, productId: '' })); // Reset product selection
    } else {
      setAvailableProducts([]);
    }
  }, [newOrder.vendorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.vendorId || !newOrder.productId || newOrder.quantity <= 0) {
      alert('Please fill out all fields correctly.');
      return;
    }

    // Generate UUIDs for the QR codes
    const generatedQRs = Array.from({ length: newOrder.quantity }, () => crypto.randomUUID());

    const order = {
      id: `ORD-${Date.now()}`,
      vendorName: mockVendors[newOrder.vendorId].name,
      productName: availableProducts.find(p => p.id === newOrder.productId).name,
      quantity: newOrder.quantity,
      createdAt: new Date(),
      qrcodes: generatedQRs,
    };

    setOrders([order, ...orders]);
    setShowOrderForm(false);
    setNewOrder({ vendorId: '', productId: '', quantity: 100 });
    alert(`Order ${order.id} created successfully!`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Vendor Orders</h4>
        {!showOrderForm && <button className="btn btn-primary" onClick={() => setShowOrderForm(true)}><i className="bi bi-plus-lg me-2"></i>Create New Order</button>}
      </div>

      {showOrderForm && (
        <div className="card-body border-bottom">
          <h5>Create Order</h5>
          <form onSubmit={handleGenerateOrder}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Vendor</label>
                <select name="vendorId" value={newOrder.vendorId} onChange={handleInputChange} className="form-select" required>
                  <option value="">Select a vendor</option>
                  {Object.entries(mockVendors).map(([id, vendor]) => <option key={id} value={id}>{vendor.name}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Product</label>
                <select name="productId" value={newOrder.productId} onChange={handleInputChange} className="form-select" required disabled={!newOrder.vendorId}>
                  <option value="">{newOrder.vendorId ? 'Select a product' : 'Select vendor first'}</option>
                  {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Quantity</label>
                <input type="number" name="quantity" value={newOrder.quantity} onChange={handleInputChange} className="form-control" min="1" required />
              </div>
            </div>
            <button type="submit" className="btn btn-success me-2">Generate Order</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr><th>Order ID</th><th>Vendor</th><th>Product</th><th>Quantity</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan="6" className="text-center p-4">No orders created yet.</td></tr>}
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>{order.id}</td><td>{order.vendorName}</td><td>{order.productName}</td><td>{order.quantity}</td><td>{order.createdAt.toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-info" 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <i className={`bi me-1 ${expandedOrderId === order.id ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      {expandedOrderId === order.id ? 'Hide' : 'View'} Codes
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan="6" className="p-3 bg-light">
                      <h6 className="mb-2">Generated UUIDs for Order {order.id}</h6>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '0.25rem', padding: '0.5rem' }}>
                        <ul className="list-unstyled mb-0 font-monospace small">{order.qrcodes.map((qr, index) => <li key={index}>{qr}</li>)}</ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrders;