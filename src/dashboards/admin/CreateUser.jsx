import React, { useState, useEffect } from 'react';
import UserService from '../../UserService';
import API_BASE_URL from '../../config';
import './CreateUser.css';

const CreateUser = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'SUPPORT',
        vendorId: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        if (user.role === 'VENDOR') {
            const fetchVendors = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/v1/vendors`);
                    if (response.ok) {
                        const data = await response.json();
                        setVendors(data);
                    }
                } catch (error) {
                    console.error("Error fetching vendors", error);
                }
            };
            fetchVendors();
        }
    }, [user.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (status.message) setStatus({ type: '', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const payload = {
            ...user,
            vendorId: user.role === 'VENDOR' ? user.vendorId : null
        };

        try {
            const response = await UserService.createUser(payload);
            setStatus({ type: 'success', message: `User created successfully! ID: ${response.data.id || 'N/A'}` });
            setUser({
                username: '',
                email: '',
                password: '',
                role: 'SUPPORT',
                vendorId: ''
            });
        } catch (error) {
            console.error("Error creating user", error);
            const errorMsg = error.response?.data || "An error occurred while creating the user.";
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-user-container">
            <div className="form-card">
                <h2>Create System User</h2>
                {status.message && (
                    <div className={`alert ${status.type}`}>
                        {status.message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={user.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={user.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={user.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" value={user.role} onChange={handleChange}>
                            <option value="ADMIN">Admin Team</option>
                            <option value="SUPPORT">Support Team</option>
                            <option value="VENDOR">Vendor</option>
                        </select>
                    </div>
                    {user.role === 'VENDOR' && (
                        <div className="form-group highlight-group">
                            <label htmlFor="vendorId">Select Vendor</label>
                            <select id="vendorId" name="vendorId" value={user.vendorId} onChange={handleChange} required>
                                <option value="">-- Choose Vendor --</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            <small>Required for Vendor users.</small>
                        </div>
                    )}
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;