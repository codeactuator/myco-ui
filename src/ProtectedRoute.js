import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // If no user, redirect to a business login page (which we can create next)
    return <Navigate to="/business-login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not allowed, show an unauthorized message or redirect
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;