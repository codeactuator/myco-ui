import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';
import UserLayout from './UserLayout';
import OtpInputs from './OtpInputs';

const AddContact = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    // Ensure user is logged in
    if (!userId) {
      navigate("/signup");
    } else {
      fetchContacts(userId);
    }
  }, [navigate]);

  const fetchContacts = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contact");

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem("userId");

    if (!name.trim() || !number.trim() || !relation.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(number)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/v1/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: number }),
      });
      
      if (!res.ok) throw new Error("Failed to send OTP.");
      
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSave = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) {
      setError("Please enter valid OTP");
      return;
    }

    setIsVerifying(true);
    setError("");
    const userId = sessionStorage.getItem("userId");

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${API_BASE_URL}/v1/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: number, otp: fullOtp })
      });

      if (!verifyRes.ok) throw new Error("Invalid OTP");

      // 2. Ensure Contact is a User
      let contactUserId;
      const userCheckRes = await fetch(`${API_BASE_URL}/v1/users/${number}`);
      if (userCheckRes.ok) {
        const userData = await userCheckRes.json();
        contactUserId = userData.id;
      } else {
        // Create User if not exists
        const createUserRes = await fetch(`${API_BASE_URL}/v1/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, mobileNumber: number }),
        });
        if (!createUserRes.ok) throw new Error("Failed to register contact as user");
        const newUserData = await createUserRes.json();
        contactUserId = newUserData.id;
      }

      // 3. Save Contact
      const response = await fetch(`${API_BASE_URL}/v1/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: name,
          contactNumber: number,
          relation,
          appUser: { id: userId }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact.");
      }

      setName('');
      setNumber('');
      setRelation('');
      setOtp(['', '', '', '']);
      setStep('details');
      fetchContacts(userId);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const resetModal = () => {
    setShowModal(false);
    setStep('details');
    setError('');
    setOtp(['', '', '', '']);
  };

  return (
    <UserLayout pageTitle="My Contacts">
      <div className="container">
        {/* Floating Action Button */}
        <button
          className="btn btn-primary rounded-circle position-fixed shadow"
          style={{ bottom: "20px", right: "20px", width: "56px", height: "56px", zIndex: 1050 }}
          onClick={() => setShowModal(true)}
          title="Add New Contact"
        >
          <i className="bi bi-plus-lg fs-4"></i>
        </button>

        {/* Add Contact Modal */}
        {showModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">New Emergency Contact</h5>
                  <button type="button" className="btn-close" onClick={resetModal}></button>
                </div>
                <div className="modal-body">
                  {step === 'details' ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mobile Number</label>
                      <input type="tel" className="form-control" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="10-digit number" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Relation</label>
                      <select className="form-select" value={relation} onChange={(e) => setRelation(e.target.value)}>
                        <option value="">Select Relation</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {error && <div className="text-danger mb-3 text-center">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Verify & Save Contact'}
                    </button>
                  </form>
                  ) : (
                    <div>
                      <p className="text-center mb-3">Enter OTP sent to <strong>{number}</strong></p>
                      <OtpInputs otp={otp} handleOtpChange={handleOtpChange} />
                      {error && <div className="text-danger mt-3 text-center">{error}</div>}
                      <button 
                        className="btn btn-success w-100 mt-4" 
                        onClick={handleVerifyAndSave}
                        disabled={isVerifying}
                      >
                        {isVerifying ? 'Verifying...' : 'Verify OTP & Save'}
                      </button>
                      <button className="btn btn-link w-100 mt-2" onClick={() => setStep('details')}>Back</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className="row justify-content-center mt-3">
          <div className="col-lg-8">
            {contacts.length === 0 ? (
              <div className="text-center text-muted mt-5">
                <i className="bi bi-person-rolodex fs-1 mb-3 d-block"></i>
                <p>No contacts added yet. Click the + button to add one.</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div className="card mb-3 shadow-sm" key={contact.id}>
                  <div className="card-body position-relative">
                    <h6 className="card-title mb-1">{contact.contactName}</h6>
                    <p className="card-text text-muted mb-0 small">{contact.contactNumber}</p>
                    <p className="card-text text-muted mb-0 small">{contact.relation}</p>
                    <button className="btn btn-sm text-danger position-absolute top-0 end-0 m-2" onClick={() => handleDelete(contact.id)} title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default AddContact;