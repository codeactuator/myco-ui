import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { userId, mobileNumber } = location.state || {};

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/home', { state: { userId, mobileNumber } });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light text-center">
      <h1 className="display-4 text-success mb-3">🎉 Thank You!</h1>
      <p className="lead">Your request has been successfully submitted.</p>
      <p className="text-muted">Redirecting to home page in a few seconds...</p>
    </div>
  );
};

export default ThankYouPage;
