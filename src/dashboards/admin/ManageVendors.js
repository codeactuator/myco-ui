import React, { useState } from 'react';

const initialVendors = [
  { id: 'V001', name: 'Premium Bags Co.', contact: 'Alice Johnson', email: 'alice@premiumbags.com' },
  { id: 'V002', name: 'City Wallets Inc.', contact: 'Bob Williams', email: 'bob@citywallets.com' },
];

const ManageVendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', contact: '', email: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    const newVendorWithId = { ...newVendor, id: `V00${vendors.length + 1}` };
    setVendors(prev => [...prev, newVendorWithId]);
    setNewVendor({ name: '', contact: '', email: '' });
    setShowForm(false);
    alert('Vendor added successfully!');
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Vendor Management</h4>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? 'bi-x' : 'bi-plus-lg'} me-2`}></i>
          {showForm ? 'Cancel' : 'Add New Vendor'}
        </button>
      </div>

      {showForm && (
        <div className="card-body border-bottom">
          <form onSubmit={handleAddVendor}>
            <div className="row">
              <div className="col-md-4 mb-3"><input type="text" name="name" value={newVendor.name} onChange={handleInputChange} className="form-control" placeholder="Vendor Name" required /></div>
              <div className="col-md-3 mb-3"><input type="text" name="contact" value={newVendor.contact} onChange={handleInputChange} className="form-control" placeholder="Contact Person" required /></div>
              <div className="col-md-3 mb-3"><input type="email" name="email" value={newVendor.email} onChange={handleInputChange} className="form-control" placeholder="Contact Email" required /></div>
              <div className="col-md-2 mb-3 d-grid"><button type="submit" className="btn btn-success">Save Vendor</button></div>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.contact}</td>
                <td>{vendor.email}</td>
                <td><button className="btn btn-sm btn-outline-secondary">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageVendors;