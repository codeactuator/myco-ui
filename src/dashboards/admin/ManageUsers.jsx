import React, { useState, useEffect } from 'react';
import UserService from '../../UserService';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'SUPPORT',
        vendorId: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchVendors();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await UserService.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await UserService.deleteUser(id);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await UserService.toggleUserStatus(id);
            toast.success("User status updated");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '', // Keep empty to not change, or require new one
            role: user.role,
            vendorId: user.vendorId || ''
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'SUPPORT',
            vendorId: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', role: 'SUPPORT', vendorId: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            vendorId: formData.role === 'VENDOR' ? parseInt(formData.vendorId) : null
        };

        try {
            if (editingUser) {
                await UserService.updateUser(editingUser.id, payload);
                toast.success("User updated successfully");
            } else {
                await UserService.createUser(payload);
                toast.success("User created successfully");
            }
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Manage Users</h3>
                <div>
                    <button className="btn btn-success me-2" onClick={handleCreate}>
                        <i className="bi bi-plus-lg me-2"></i> Create User
                    </button>
                    <button className="btn btn-primary" onClick={fetchUsers}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                    </button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="table-responsive bg-white shadow-sm rounded">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role} {user.vendorId && <small className="text-muted">(ID: {user.vendorId})</small>}</td>
                                    <td>
                                        <span className={`badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleToggleStatus(user.id)} title="Toggle Status">
                                            <i className={`bi ${user.status === 'ACTIVE' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(user)} title="Edit">
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)} title="Delete">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingUser ? 'Edit User' : 'Create New User'}</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3"><label className="form-label">Username</label><input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} disabled={!!editingUser} required /></div>
                                    <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required /></div>
                                    <div className="mb-3"><label className="form-label">Password {editingUser ? '(Leave blank to keep current)' : '(Required)'}</label><input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required={!editingUser} /></div>
                                    <div className="mb-3"><label className="form-label">Role</label><select className="form-select" name="role" value={formData.role} onChange={handleChange}><option value="ADMIN">Admin</option><option value="SUPPORT">Support</option><option value="VENDOR">Vendor</option></select></div>
                                    {formData.role === 'VENDOR' && <div className="mb-3"><label className="form-label">Vendor</label><select className="form-select" name="vendorId" value={formData.vendorId} onChange={handleChange} required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>}
                                    <div className="d-flex justify-content-end gap-2"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button><button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Create'}</button></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;