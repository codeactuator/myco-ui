import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserLayout from './UserLayout';
import { apiFetch } from './utils/api';

const RegisterProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resolveUid = async () => {
      // Extract UID from URL
      const queryParams = new URLSearchParams(location.search);
      let rawUid = queryParams.get('uid');

      if (!rawUid) {
        toast.error("No product ID found in URL.");
        navigate("/home"); // Redirect if no UID
        return;
      }

      // Check if it's a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawUid)) {
        setUid(rawUid);
        return;
      }

      // Extract code if it's a short URL (contains /q/)
      let shortCode = rawUid;
      if (rawUid.includes('/q/')) {
        const parts = rawUid.split('/q/');
        if (parts.length > 1) {
          shortCode = parts[1].split(/[?#]/)[0];
        }
      }

      // Resolve short code
      try {
        const data = await apiFetch(`/v1/short-links/${shortCode}`);
        setUid(data.uuid);
      } catch (error) {
        console.error("Error resolving short code", error);
        toast.error("Invalid or expired product code.");
        navigate("/home");
      }
    };

    resolveUid();

    // Get logged-in user ID from session storage
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      toast.warn("You must be logged in to register a product.");
      navigate("/signup"); // The SignUpPage handles login
    }
  }, [location.search, navigate]);

  const handleRegisterProduct = async () => {
    if (!uid || !userId) {
      toast.error("Missing product or user information.");
      return;
    }

    setIsRegistering(true);
    setError(null);
    try {
      // Make the API call to register the product
      await apiFetch('/v1/products/register', {
        method: 'POST',
        body: JSON.stringify({ userId, productInstanceId: uid }),
      });

      toast.success(`Product ${uid} registered successfully!`);
      navigate("/home"); // Redirect to home (products list)

    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "Failed to register product.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <UserLayout pageTitle="Register Product">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
              </div>
            )}
            <div className="card shadow-sm">
              <div className="card-body text-center p-4">
                {uid ? (<p className="fs-5">You are about to register product with ID: <br /><strong className="text-primary">{uid}</strong></p>) : <p>Loading product information...</p>}
                <button className="btn btn-primary w-100 mt-3" onClick={handleRegisterProduct} disabled={!uid || isRegistering}>
                  {isRegistering ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default RegisterProductPage;