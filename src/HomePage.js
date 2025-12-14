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
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");
  const mobileNumber = sessionStorage.getItem("mobile");

  useEffect(() => {
    if (!userId) {
      navigate("/signup");
      return;
    }
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setEmergencyContacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    const confirmed = window.confirm("Are you sure you want to delete this contact?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contact");

      setEmergencyContacts((prev) => prev.filter((c) => c.id !== contactId));

      const toastEl = document.getElementById("deleteToast");
      const toast = new window.bootstrap.Toast(toastEl);
      toast.show();
    } catch (err) {
      alert(err.message);
    }
  };

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

  const renderContactCard = (contact) => (
    <div className="card mb-2 shadow-sm" key={contact.id} style={{ borderRadius: "1rem" }}>
      <div className="card-body">
        <h5 className="card-title mb-1">{contact.contactName}</h5>
        <p className="card-text text-muted mb-0">{contact.contactNumber}</p>
        <p className="card-text text-muted mb-0">{contact.relation}</p>
        <button
          className="btn position-absolute top-0 end-0 m-2 text-muted"
          onClick={() => handleDelete(contact.id)}
          title="Delete Contact"
        >
          <i className="bi bi-trash-fill"></i>
        </button>
      </div>
    </div>
  );

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

      <button
        className="btn btn-primary rounded-circle position-fixed shadow"
        style={{ bottom: "20px", right: "20px", width: "56px", height: "56px", zIndex: 1050 }}
        onClick={() => navigate("/add-contact", { state: { userId, mobileNumber } })}
        title="Add Contact"
      >
        <i className="bi bi-plus-lg fs-4"></i>
      </button>

      <div className="container py-4">
        {loading && <p>Loading contacts...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <section className="mb-4">
            {emergencyContacts.length === 0 ? (
              <p className="text-muted">No emergency contacts found.</p>
            ) : (
              emergencyContacts.map(renderContactCard)
            )}
          </section>
        )}
      </div>

      {/* Toast Notification */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div
          id="deleteToast"
          className="toast align-items-center text-bg-danger border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">Contact deleted successfully!</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default HomePage;
