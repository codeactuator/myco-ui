import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { initialVendors } from './mockData';


const ManageVendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingVendor({ name: '', contact: '', email: '', phone: '', products: [] });
    setShowForm(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingVendor(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVendor.id) {
      // Update existing vendor
      setVendors(vendors.map(v => v.id === editingVendor.id ? editingVendor : v));
      toast.success('Vendor updated successfully!');
    } else {
      // Add new vendor
      const newVendorWithId = { ...editingVendor, id: `V00${vendors.length + 1}` };
      setVendors([...vendors, newVendorWithId]);
      toast.success('Vendor added successfully!');
    }
    handleCancel();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Vendor Management</h4>
        {!showForm && <button className="btn btn-primary" onClick={handleAddNew}><i className="bi bi-plus-lg me-2"></i>Add New Vendor</button>}
      </div>

      {showForm && (
        <div className="card-body border-bottom">
          <h5>{editingVendor.id ? 'Edit Vendor' : 'Add New Vendor'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3"><label className="form-label">Vendor Name</label><input type="text" name="name" value={editingVendor.name} onChange={handleInputChange} className="form-control" required /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Contact Person</label><input type="text" name="contact" value={editingVendor.contact} onChange={handleInputChange} className="form-control" required /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Email</label><input type="email" name="email" value={editingVendor.email} onChange={handleInputChange} className="form-control" required /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Phone</label><input type="tel" name="phone" value={editingVendor.phone} onChange={handleInputChange} className="form-control" required /></div>
            </div>
            <button type="submit" className="btn btn-success me-2">Save Vendor</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
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
                <td>{vendor.phone}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(vendor)} title="Edit Vendor"><i className="bi bi-pencil-fill"></i> Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageVendors;