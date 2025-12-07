import React, { useState } from 'react';

const initialVendors = [
  { id: 'V001', name: 'Premium Bags Co.', contact: 'Alice Johnson', email: 'alice@premiumbags.com', phone: '123-456-7890', products: [{ id: 'P01', name: 'Premium Leather Wallet' }, { id: 'P03', name: 'Traveler\'s Passport Holder' }] },
  { id: 'V002', name: 'City Wallets Inc.', contact: 'Bob Williams', email: 'bob@citywallets.com', phone: '234-567-8901', products: [{ id: 'P02', name: 'City Explorer Backpack' }] },
  { id: 'V003', name: 'Urban Gear Co.', contact: 'Charlie Brown', email: 'charlie@urbangear.com', phone: '345-678-9012', products: [{ id: 'P04', name: 'Canvas Messenger Bag' }] },
];

const ManageVendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [managingProductsFor, setManagingProductsFor] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

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
      alert('Vendor updated successfully!');
    } else {
      // Add new vendor
      const newVendorWithId = { ...editingVendor, id: `V00${vendors.length + 1}` };
      setVendors([...vendors, newVendorWithId]);
      alert('Vendor added successfully!');
    }
    handleCancel();
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const vendorToUpdate = vendors.find(v => v.id === managingProductsFor.id);
    let updatedProducts;

    if (editingProduct.originalId) { // Editing existing product
      updatedProducts = vendorToUpdate.products.map(p =>
        p.id === editingProduct.originalId ? { id: editingProduct.id, name: editingProduct.name } : p
      );
      alert('Product updated successfully!');
    } else { // Adding new product
      updatedProducts = [...vendorToUpdate.products, { id: editingProduct.id, name: editingProduct.name }];
      alert('Product added successfully!');
    }

    setVendors(vendors.map(v => v.id === vendorToUpdate.id ? { ...v, products: updatedProducts } : v));
    setManagingProductsFor(prev => ({ ...prev, products: updatedProducts }));
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, originalId: product.id });
    setShowProductForm(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct({ id: '', name: '' });
    setShowProductForm(true);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Vendor Management</h4>
        {!showForm && <button className="btn btn-primary" onClick={handleAddNew}><i className="bi bi-plus-lg me-2"></i>Add New Vendor</button>}
      </div>

      {/* Inline Products Section */}
      {managingProductsFor && (
        <div className="card-body border-bottom bg-light">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Manage Products for {managingProductsFor.name}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => { setManagingProductsFor(null); setShowProductForm(false); setEditingProduct(null); }}
              aria-label="Close"
            ></button>
          </div>

          {!showProductForm && <button className="btn btn-primary mb-3" onClick={handleAddNewProduct}><i className="bi bi-plus-lg me-2"></i>Add New Product</button>}

          {showProductForm && (
            <div className="card mb-4">
              <div className="card-body">
                <h6>{editingProduct.originalId ? 'Edit Product' : 'Add New Product'}</h6>
                <form onSubmit={handleProductSubmit}>
                  <div className="row">
                    <div className="col-md-4 mb-3"><label className="form-label">Product ID</label><input type="text" name="id" value={editingProduct.id} onChange={handleProductInputChange} className="form-control" required /></div>
                    <div className="col-md-8 mb-3"><label className="form-label">Product Name</label><input type="text" name="name" value={editingProduct.name} onChange={handleProductInputChange} className="form-control" required /></div>
                  </div>
                  <button type="submit" className="btn btn-success me-2">Save Product</button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Cancel</button>
                </form>
              </div>
            </div>
          )}

          <h6>Existing Products</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered bg-white">
              <thead className="table-light">
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {managingProductsFor.products.length === 0 && <tr><td colSpan="3" className="text-center">No products found.</td></tr>}
                {managingProductsFor.products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditProduct(product)}>
                        <i className="bi bi-pencil-fill"></i> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(vendor)} title="Edit Vendor"><i className="bi bi-pencil-fill"></i></button>
                  <button className="btn btn-sm btn-outline-info" onClick={() => setManagingProductsFor(vendor)} title="Manage Products"><i className="bi bi-box-seam"></i></button>
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