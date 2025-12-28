import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserLayout from './UserLayout';
import API_BASE_URL from './config';

const MyProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/signup");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/products/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId, navigate]);

  return (
    <UserLayout pageTitle="My Registered Products">
      <div className="container">
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center mt-5">
            <i className="bi bi-box-seam fs-1 text-muted"></i>
            <p className="fs-5 text-muted mt-3">You haven't registered any products yet.</p>
            <button className="btn btn-primary mt-2" onClick={() => navigate('/home')}>
              Scan to Register
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-bag-check fs-1 text-secondary"></i>
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{product.name || 'Product Name'}</h5>
                    <p className="card-text text-muted small">
                      Registered: {product.registrationDate ? new Date(product.registrationDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="card-text">{product.description || 'No description available.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyProductsPage;