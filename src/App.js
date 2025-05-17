import logo from './logo.svg';
import "bootstrap-icons/font/bootstrap-icons.css";
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './SignUpPage';
import OtpPage from './OtpPage';
import HomePage from './HomePage';
import AddContactPage from "./AddContactPage";
import QrCodePage from "./QrCodePage";
import ScanPage from "./ScanPage";
import ThankYouPage from "./ThankYouPage";
import PostListPage from "./PostListPage";
import NotificationPage from "./NotificationPage";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<SignUpPage />} />
		  <Route path="/signup" element={<SignUpPage />} />
		  <Route path="/otp" element={<OtpPage />} />
		  <Route path="/home" element={<HomePage />} />
		  <Route path="/add-contact" element={<AddContactPage />} />
		  <Route path="/qr" element={<QrCodePage />} />
		  <Route path="/scan" element={<ScanPage />} />
		  <Route path="/posts" element={<PostListPage />} />
		  <Route path="/np" element={<NotificationPage />} />
		  <Route path="/thank-you" element={<ThankYouPage />} />
	    </Routes>
      </div>
    </Router>
  );
};



export default App;
