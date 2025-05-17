import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from "./config";

const AddContactPage = () => {
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relation, setRelation] = useState("Family");
  const [customRelation, setCustomRelation] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const { userId, mobileNumber } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalRelation = relation === "Others" ? customRelation : relation;

    const newContact = {
      contactName,
      contactNumber,
      relation: finalRelation.toUpperCase(), // assuming backend expects UPPERCASE
      appUser: { id: userId }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact)
      });

      if (!res.ok) throw new Error("Failed to add contact");

      alert("Contact added successfully!");
      navigate("/home", { state: { userId, mobileNumber } });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <header className="bg-primary text-white py-3 shadow-sm sticky-top">
        <div className="container d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Add Contact</h4>
          <button
            className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => navigate("/home")}
            style={{ width: "40px", height: "40px" }}
            aria-label="Home"
          >
            <i className="bi bi-house-door-fill fs-4"></i>
          </button>
        </div>
      </header>

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
          <label className="form-label">Relation</label>
          <select
            className="form-select"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            required
          >
            <option value="Family">Family</option>
            <option value="Friends">Friends</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {relation === "Others" && (
          <div className="mb-3">
            <label className="form-label">Specify Relation</label>
            <input
              type="text"
              className="form-control"
              value={customRelation}
              onChange={(e) => setCustomRelation(e.target.value)}
              required
            />
          </div>
        )}

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
