import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';
import UserLayout from './UserLayout';

const UserDetailsPage = () => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      fetchUser(userId);
    }
  }, []);

  const fetchUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/users/id/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setMobileNumber(data.mobileNumber || '');
      }
    } catch (err) {
      console.error("Failed to fetch user details", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    const userId = sessionStorage.getItem("userId");

    try {
      const res = await fetch(`${API_BASE_URL}/v1/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage('Profile updated successfully!');
        sessionStorage.setItem("userName", data.name);
        // Optional: Trigger a reload or state update if needed to refresh the header immediately
        window.location.reload(); 
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout pageTitle="User Details">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Mobile Number</label>
                <input type="text" className="form-control" value={mobileNumber} disabled readOnly />
                <div className="form-text">Mobile number cannot be changed.</div>
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your name"
                  required 
                />
              </div>
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDetailsPage;