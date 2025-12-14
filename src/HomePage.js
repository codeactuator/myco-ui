import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess, onScanFailure, closeScanner }) => {
  useEffect(() => {
    // Check if a scanner is already active to prevent duplicates
    if (document.getElementById('qr-reader')?.innerHTML) {
      return;
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
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
    try {
      // If the decoded text is a full URL to our app, navigate to it
      const url = new URL(decodedText);
      if (url.origin === window.location.origin && url.pathname === '/register' && url.searchParams.has('uid')) {
        navigate(url.pathname + url.search);
        return;
      }
    } catch (_) {
      // Not a valid URL, assume it's a UID
    }
    // Assume the decoded text is the UID and navigate
    navigate(`/register?uid=${decodedText}`);
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
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header className="bg-primary text-white py-3 shadow-sm sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="mb-0">myco</h1>
          <div className="d-flex">
              <button
                  className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center me-2"
                  onClick={() => setShowScanner(true)}
                  style={{ width: "40px", height: "40px" }}
                  aria-label="Register Product"
                  title="Register New Product"
                >
              <i className="bi bi-upc-scan"></i>
            </button>
              <button
                  className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center me-2"
                  onClick={() => navigate("/np")}
                  style={{ width: "40px", height: "40px" }}
                  aria-label="Notifications"
                >
              <i className="bi bi-bell-fill"></i>
            </button>
            <button
              className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center me-2"
              onClick={() => navigate("/qr")}
              style={{ width: "40px", height: "40px" }}
              aria-label="QR Code"
            >
              <i className="bi bi-qr-code-scan"></i>
            </button>
            <button
              className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              onClick={() => navigate("/posts")}
              style={{ width: "40px", height: "40px" }}
              aria-label="List"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>
      </header>

      {/* QR Code Scanner Modal */}
      {showScanner && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onScanFailure={handleScanFailure}
          closeScanner={() => setShowScanner(false)}
        />
      )}
      <button
        className="btn btn-primary rounded-circle position-fixed shadow"
        style={{ bottom: "20px", right: "20px", width: "56px", height: "56px", zIndex: 1050 }}
        data-bs-toggle="modal"
        data-bs-target="#addContactModal"
        onClick={() => navigate("/add-contact", { state: { userId, mobileNumber } })}
        title="Add Contact"
      >
        <i className="bi bi-plus-lg fs-4"></i>
      </button>

      <main className="container py-4 flex-grow-1">
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
      </main>

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
    </div>
  );
};

export default HomePage;
