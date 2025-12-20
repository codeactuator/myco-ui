import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import { Html5QrcodeScanner } from 'html5-qrcode';
import UserLayout from "./UserLayout";

const QrScanner = ({ onScanSuccess, onScanFailure, closeScanner }) => {
  useEffect(() => {
    // Check if a scanner is already active to prevent duplicates
    if (document.getElementById('qr-reader')?.innerHTML) {
      return;
    }

    // Configuration for the scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      // Explicitly request the rear camera
      videoConstraints: { facingMode: "environment" }
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false // verbose
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    return () => {
      // Ensure the scanner is cleared only if it's still running
      if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2) { // 2 is SCANNING state
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear scanner.", error);
        });
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Scan Product QR Code</h5><button type="button" className="btn-close" onClick={closeScanner}></button></div>
          <div className="modal-body"><div id="qr-reader"></div></div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");
  const mobileNumber = sessionStorage.getItem("mobile");

  useEffect(() => {
    if (!userId) {
      navigate("/signup");
      return;
    }
  }, [userId]);

  const handleScanSuccess = (decodedText) => {
    setShowScanner(false);
    let productId = decodedText; // Default to using the full scanned text

    try {
      // Check if the decoded text is a URL. If so, try to get the 'uid' parameter from it.
      const url = new URL(decodedText);
      if (url.searchParams.has('uid')) {
        productId = url.searchParams.get('uid');
      }
    } catch (_) {
      // Not a valid URL, so we'll use the decodedText as the productId.
    }
    // Navigate to the registration page with the extracted or original ID.
    navigate(`/register?uid=${productId}`);
  };

  const handleScanFailure = (errorMessage) => {
    // This can be noisy, so we'll just log it for debugging.
    // console.log(`QR Scan Error: ${errorMessage}`);
  };

  return (
    <UserLayout pageTitle="Home">
      {/* QR Code Scanner Modal */}
      {showScanner && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={handleScanFailure}
          closeScanner={() => setShowScanner(false)}
        />
      )}
      <button
        className="btn btn-info rounded-circle position-fixed shadow"
        onClick={() => setShowScanner(true)}
        style={{ bottom: "90px", right: "20px", width: "56px", height: "56px", zIndex: 1050, color: 'white' }}
        title="Register New Product"
      >
        <i className="bi bi-upc-scan fs-4"></i>
      </button>

      <div className="container py-4">
        <div className="text-center mt-5">
          <h4 className="text-muted">Welcome to MyCo</h4>
          <p>Scan a product or manage your profile.</p>
        </div>
      </div>
    </UserLayout>
  );
};

export default HomePage;
