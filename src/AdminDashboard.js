import React from 'react';
import { useAuth } from './AuthContext';
import AdminView from './AdminView';
import VendorView from './VendorView';
import SupportView from './SupportView';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Render the appropriate view based on the user's role
  switch (user?.role) {
    case 'ADMIN':
      return <AdminView />;
    case 'VENDOR':
      return <VendorView />;
    case 'SUPPORT':
      return <SupportView />;
    default:
      // Fallback or loading state
      return <div className="container text-center mt-5"><h1>Loading Dashboard...</h1></div>;
  }
};

export default AdminDashboard;