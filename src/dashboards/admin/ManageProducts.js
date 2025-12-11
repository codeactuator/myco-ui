import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { initialVendors } from './mockData';


const ManageProducts = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    let updatedProducts;

    if (editingProduct.originalId) { // Editing existing product
      updatedProducts = selectedVendor.products.map(p =>
        p.id === editingProduct.originalId ? { id: editingProduct.id, name: editingProduct.name } : p
      );
      toast.success('Product updated successfully!');
    } else { // Adding new product
      updatedProducts = [...selectedVendor.products, { id: editingProduct.id, name: editingProduct.name }];
      toast.success('Product added successfully!');
    }

    setVendors(vendors.map(v => v.id === selectedVendorId ? { ...v, products: updatedProducts } : v));
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, originalId: product.id });
  };

  const handleAddNewProduct = () => {
    setEditingProduct({ id: '', name: '' });
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h4 className="mb-0">Vendor Product Management</h4>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <label htmlFor="vendorSelect" className="form-label fs-5">Select a Vendor</label>
          <select id="vendorSelect" className="form-select" value={selectedVendorId} onChange={e => { setSelectedVendorId(e.target.value); setEditingProduct(null); }}>
            <option value="">-- Choose a Vendor --</option>
            {vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
          </select>
        </div>

        {selectedVendor && (
          <div>
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Products for {selectedVendor.name}</h5>
              {!editingProduct && <button className="btn btn-primary" onClick={handleAddNewProduct}><i className="bi bi-plus-lg me-2"></i>Add New Product</button>}
            </div>

            {editingProduct && (
              <div className="card mb-4 bg-light">
                <div className="card-body">
                  <h6>{editingProduct.originalId ? 'Edit Product' : 'Add New Product'}</h6>
                  <form onSubmit={handleProductSubmit}>
                    <div className="row align-items-end">
                      <div className="col-md-4 mb-3"><label className="form-label">Product ID</label><input type="text" name="id" value={editingProduct.id} onChange={handleProductInputChange} className="form-control" required /></div>
                      <div className="col-md-5 mb-3"><label className="form-label">Product Name</label><input type="text" name="name" value={editingProduct.name} onChange={handleProductInputChange} className="form-control" required /></div>
                      <div className="col-md-3 mb-3">
                        <button type="submit" className="btn btn-success me-2">Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendor.products.length === 0 && <tr><td colSpan="3" className="text-center">No products found for this vendor.</td></tr>}
                  {selectedVendor.products.map(product => (
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
      </div>
    </div>
  );
};

export default ManageProducts;