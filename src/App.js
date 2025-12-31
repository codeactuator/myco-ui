import logo from './logo.svg';
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './SignUpPage';
import OtpPage from './OtpPage';
import HomePage from './HomePage';
import AddContact from "./AddContact";
import QrCodePage from "./QrCodePage";
import ScanPage from "./ScanPage";
import ThankYouPage from "./ThankYouPage";
import PostListPage from "./PostListPage";
import NotificationPage from "./NotificationPage";
import NotificationDetailsPage from './NotificationDetailsPage';
import AdminLoginPage from './AdminLoginPage';
import VendorLoginPage from './VendorLoginPage';
import SupportLoginPage from './SupportLoginPage';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from './AdminDashboard';
import RegisterProductPage from './RegisterProductPage';
import MyProductsPage from './MyProductsPage';
import UserLayout from './UserLayout';
import VendorView from './VendorView';
import PromotionPreviewPage from './PromotionPreviewPage';
import ShortUrlHandler from './ShortUrlHandler';
import UserDetailsPage from './UserDetailsPage';

const DashboardSwitcher = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'VENDOR':
      return <VendorView />;
    default:
      return <AdminDashboard />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Consumer App Routes */}
            <Route path="/" element={<SignUpPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/add-contact" element={<AddContact />} />
            <Route path="/qr" element={<QrCodePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/q/:shortId" element={<ShortUrlHandler />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/np" element={<NotificationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/notification-details/:postId" element={<NotificationDetailsPage />} />
            <Route path="/register" element={<RegisterProductPage />} />
            <Route path="/my-products" element={<MyProductsPage />} />
            <Route path="/promotions/:id" element={<PromotionPreviewPage />} />
            <Route path="/user-details" element={<UserDetailsPage />} />
            
            {/* Business App Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/support/login" element={<SupportLoginPage />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'VENDOR', 'SUPPORT']}>
                <DashboardSwitcher />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<div className="container text-center mt-5"><h1>403 - Unauthorized</h1><p>You do not have permission to view this page.</p></div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};



export default App;
