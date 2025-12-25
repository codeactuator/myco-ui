import React, { useState, useEffect } from 'react';
import PromotionService from '../../PromotionService';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';

const ManagePromotions = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        if (user && user.vendorId) {
            fetchPromotions();
        }
    }, [user]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await PromotionService.getPromotionsByVendor(user.vendorId);
            setPromotions(response.data);
        } catch (error) {
            toast.error("Failed to fetch promotions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPromo(null);
        setSelectedImage(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            startDate: '',
            endDate: '',
            status: 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setSelectedImage(null);
        setFormData({
            code: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            startDate: promo.startDate,
            endDate: promo.endDate,
            status: promo.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this promotion?")) return;
        try {
            await PromotionService.deletePromotion(id);
            toast.success("Promotion deleted successfully");
            fetchPromotions();
        } catch (error) {
            toast.error("Failed to delete promotion");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            vendor: { id: user.vendorId }
        };

        const data = new FormData();
        data.append('promotion', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (selectedImage) {
            data.append('image', selectedImage);
        }

        try {
            if (editingPromo) {
                await PromotionService.updatePromotion(editingPromo.id, data);
                toast.success("Promotion updated successfully");
            } else {
                await PromotionService.createPromotion(data);
                toast.success("Promotion created successfully");
            }
            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            toast.error("Failed to save promotion");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Manage Promotions</h3>
                <button className="btn btn-success" onClick={handleCreate}>
                    <i className="bi bi-plus-lg me-2"></i> Add Promotion
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="table-responsive bg-white shadow-sm rounded">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Image</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map(promo => (
                                <tr key={promo.id}>
                                    <td>
                                        {promo.imageUrl ? (
                                            <i className="bi bi-image text-primary" title={promo.imageUrl}></i>
                                        ) : (
                                            <i className="bi bi-image text-muted"></i>
                                        )}
                                    </td>
                                    <td><strong>{promo.code}</strong></td>
                                    <td>{promo.description}</td>
                                    <td>{promo.discountType}</td>
                                    <td>{promo.discountValue}</td>
                                    <td>{promo.startDate} to {promo.endDate}</td>
                                    <td>
                                        <span className={`badge ${promo.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                            {promo.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(promo)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(promo.id)}>
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
                                <h5 className="modal-title">{editingPromo ? 'Edit Promotion' : 'New Promotion'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3"><label className="form-label">Code</label><input type="text" className="form-control" name="code" value={formData.code} onChange={handleChange} required /></div>
                                    <div className="mb-3"><label className="form-label">Description</label><input type="text" className="form-control" name="description" value={formData.description} onChange={handleChange} /></div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3"><label className="form-label">Type</label><select className="form-select" name="discountType" value={formData.discountType} onChange={handleChange}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed Amount</option></select></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Value</label><input type="number" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleChange} required /></div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3"><label className="form-label">Start Date</label><input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">End Date</label><input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} required /></div>
                                    </div>
                                    <div className="mb-3"><label className="form-label">Promotion Image</label><input type="file" className="form-control" onChange={(e) => setSelectedImage(e.target.files[0])} accept="image/*" /></div>
                                    <div className="mb-3"><label className="form-label">Status</label><select className="form-select" name="status" value={formData.status} onChange={handleChange}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                                    <div className="d-flex justify-content-end gap-2"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePromotions;