import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from './config';
import UserLayout from './UserLayout';

const RegisterProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

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
        const res = await fetch(`${API_BASE_URL}/v1/short-links/${shortCode}`);
        if (res.ok) {
          const data = await res.json();
          setUid(data.uuid);
        } else {
          toast.error("Invalid product code.");
          navigate("/home");
        }
      } catch (error) {
        console.error("Error resolving short code", error);
        toast.error("Failed to resolve product code.");
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
    try {
      // Make the API call to register the product
      const response = await fetch(`${API_BASE_URL}/v1/products/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: uid }),
      });

      // If the API call fails, we'll throw an error to be caught below.
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to register product." }));
        throw new Error(errorData.message);
      }

      toast.success(`Product ${uid} registered successfully!`);
      navigate("/my-products"); // Redirect to a page showing user's products

    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Failed to register product.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <UserLayout pageTitle="Register Product">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
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