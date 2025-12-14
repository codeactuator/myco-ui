import React from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserLayout from './UserLayout';

const MyProductsPage = () => {
  const navigate = useNavigate();

  return (
    <UserLayout pageTitle="My Registered Products">
      <div className="text-center">
        <p className="fs-5 text-muted">This page is under construction.</p>
      </div>
    </UserLayout>
  );
};

export default MyProductsPage;