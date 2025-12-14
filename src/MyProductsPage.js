import React from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const MyProductsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header className="bg-primary text-white py-3 shadow-sm sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Registered Products</h4>
          <button
            className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => navigate("/home")}
            style={{ width: "40px", height: "40px" }}
            aria-label="Home"
          >
            <i className="bi bi-house-door-fill fs-5"></i>
          </button>
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="text-center">
          <p className="fs-5 text-muted">This page is under construction.</p>
        </div>
      </main>
    </div>
  );
};

export default MyProductsPage;