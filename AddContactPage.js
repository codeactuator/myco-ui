import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // icon support

const AddContactPage = () => {
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactType, setContactType] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newContact = {
      name: contactName,
      contactNumber,
      type: contactType,
      userId: "your-user-id" // replace with actual user logic
    };

    try {
      const res = await fetch("http://localhost:8081/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact)
      });

      if (!res.ok) throw new Error("Failed to add contact");

      alert("Contact added successfully!");
      navigate("/home");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-primary text-white py-3 shadow-sm sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h4 className="mb-0">My Contacts</h4>
          <button
            className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            aria-label="QR Code"
          >
            <i className="bi bi-qr-code-scan"></i>
          </button>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">Contact Name</label>
          <input
            type="text"
            className="form-control"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contact Number</label>
          <input
            type="tel"
            className="form-control"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contact Type</label>
          <select
            className="form-select"
            value={contactType}
            onChange={(e) => setContactType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="Emergency">Emergency</option>
            <option value="Help">Help</option>
          </select>
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Save Contact
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContactPage;
