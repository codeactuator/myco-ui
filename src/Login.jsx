import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from './UserService';
import { useAuth } from './AuthContext';
import './Login.css';

const Login = ({ title, expectedRole, redirectPath }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await UserService.login(credentials);
            const user = response.data;

            if (user.role !== expectedRole) {
                setError(`Access Denied. This login is for ${expectedRole} users only.`);
                setLoading(false);
                return;
            }

            login(user);
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            const resData = err.response?.data;
            const errorMessage = typeof resData === 'string' 
                ? resData 
                : (resData?.message || resData?.error || "Login failed. Please check your credentials.");
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h3 className="text-center mb-4">{title}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            className="form-control"
                            value={credentials.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-control"
                            value={credentials.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;