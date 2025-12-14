import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from './config';

const RegisterProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Extract UID from URL
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('uid');
    if (productId) {
      setUid(productId);
    } else {
      toast.error("No product ID found in URL.");
      navigate("/home"); // Redirect if no UID
    }

    // Get logged-in user ID from session storage
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      toast.warn("You must be logged in to register a product.");
      navigate("/login"); // Or wherever your login page is
    }
  }, [location.search, navigate]);

  const handleRegisterProduct = async () => {
    if (!uid || !userId) {
      toast.error("Missing product or user information.");
      return;
    }

    setIsRegistering(true);
    try {
      // In a real app, you would make an API call here.
      // const response = await fetch(`${API_BASE_URL}/v1/products/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, productId: uid }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to register product.");
      // }

      // Mocking API call success
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      toast.success(`Product ${uid} registered successfully!`);
      navigate("/my-products"); // Redirect to a page showing user's products

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm" style={{ maxWidth: '500px', margin: 'auto' }}>
        <div className="card-body text-center">
          <h4 className="card-title mb-4">Register New Product</h4>
          {uid ? (
            <p>You are about to register product with ID: <strong>{uid}</strong></p>
          ) : <p>Loading product information...</p>}
          <button className="btn btn-primary w-100" onClick={handleRegisterProduct} disabled={!uid || isRegistering}>
            {isRegistering ? 'Registering...' : 'Register This Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterProductPage;