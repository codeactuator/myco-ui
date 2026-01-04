import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserLayout from './UserLayout';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiFetch } from './utils/api';

const QrScanner = ({ onScanSuccess, onScanFailure, closeScanner }) => {
  useEffect(() => {
    if (document.getElementById('qr-reader')?.innerHTML) {
      return;
    }
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      videoConstraints: { facingMode: "environment" }
    };
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2) {
        html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner.", error));
      }
    };
  }, []);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Scan Product QR Code</h5><button type="button" className="btn-close" onClick={closeScanner}></button></div>
          <div className="modal-body"><div id="qr-reader"></div></div>
        </div>
      </div>
    </div>
  );
};

const MyProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/signup");
      return;
    }

    const fetchProducts = async () => {
      try {
        const data = await apiFetch(`/v1/products/user/${userId}`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId, navigate]);

  const handleScanSuccess = (decodedText) => {
    setShowScanner(false);
    let productInstanceId = decodedText;
    try {
      const url = new URL(decodedText);
      if (url.searchParams.has('uid')) {
        productInstanceId = url.searchParams.get('uid');
      }
    } catch (_) {}
    navigate(`/register?uid=${productInstanceId}`);
  };

  return (
    <UserLayout pageTitle="My Registered Products">
      {showScanner && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={() => {}}
          closeScanner={() => setShowScanner(false)}
        />
      )}

      <button
        className="btn btn-info rounded-circle position-fixed shadow"
        onClick={() => setShowScanner(true)}
        style={{ bottom: "90px", right: "20px", width: "56px", height: "56px", zIndex: 1050, color: 'white' }}
        title="Register New Product"
      >
        <i className="bi bi-upc-scan fs-4"></i>
      </button>

      <div className="container">
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center mt-5">
            <i className="bi bi-box-seam fs-1 text-muted"></i>
            <p className="fs-5 text-muted mt-3">You haven't registered any products yet.</p>
            <button className="btn btn-primary mt-2" onClick={() => setShowScanner(true)}>
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
                    <h5 className="card-title mb-2">{product.name || 'Product Name'}</h5>
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