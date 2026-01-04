import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import API_BASE_URL from '../../config';

const ManageProducts = ({ vendorId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', imageUrl: null });
  const [creating, setCreating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (vendorId) {
      fetchProducts();
    }
  }, [vendorId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/v1/products/vendor/${vendorId}`);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name) return;

    setCreating(true);
    try {
      let productId = editingId;

      if (editingId) {
        await apiFetch(`/v1/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...newProduct })
        });
      } else {
        const productData = await apiFetch('/v1/products', {
          method: 'POST',
          body: JSON.stringify({ ...newProduct, vendor: { id: vendorId } })
        });
        productId = productData.id;
      }

      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await apiFetch(`/v1/products/${productId}/image`, {
          method: 'POST',
          body: formData
        });
      }

      setShowModal(false);
      setNewProduct({ name: '', description: '', imageUrl: null });
      setImageFile(null);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'create'} product: ` + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({ name: product.name, description: product.description || '', imageUrl: product.imageUrl });
    setEditingId(product.id);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDeleteClick = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiFetch(`/v1/products/${productId}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  const openCreateModal = () => {
    setNewProduct({ name: '', description: '', imageUrl: null });
    setEditingId(null);
    setImageFile(null);
    setShowModal(true);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Products</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-2"></i>Add Product
        </button>
      </div>

      {loading && <div className="spinner-border text-primary" role="status"></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Registered Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          {product.imageUrl ? (
                            <img 
                              src={`${API_BASE_URL}/v1/uploads/${product.imageUrl}`} 
                              alt={product.name} 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '50px', height: '50px', borderRadius: '4px', fontSize: '0.8rem' }}>No Img</div>
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>{product.registrationDate ? new Date(product.registrationDate).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(product)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(product.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? 'Edit Product' : 'Add New Product'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveProduct}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newProduct.name} 
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={newProduct.description} 
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Product Image</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
