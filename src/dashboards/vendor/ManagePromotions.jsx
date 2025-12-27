import React, { useState, useEffect } from 'react';
import PromotionService from '../../PromotionService';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config';

const ManagePromotions = () => {
    const { user } = useAuth();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewPromo, setPreviewPromo] = useState(null);
    
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

    const handlePreview = (promo) => {
        setPreviewPromo(promo);
        setShowPreview(true);
    };

    const confirmSend = async () => {
        if (!previewPromo) return;
        try {
            await PromotionService.sendPromotion(previewPromo.id);
            toast.success("Promotion sent to consumers!");
            setShowPreview(false);
            setPreviewPromo(null);
        } catch (error) {
            toast.error("Failed to send promotion");
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
                <div className="row">
                    {promotions.map(promo => (
                        <div className="col-md-4 mb-4" key={promo.id}>
                            <div className="card h-100 shadow-sm">
                                {promo.imageUrl ? (
                                    <img 
                                        src={`${API_BASE_URL}/uploads/${promo.imageUrl}`} 
                                        className="card-img-top" 
                                        alt={promo.code}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                                        <i className="bi bi-image text-muted fs-1"></i>
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title text-primary mb-0">{promo.code}</h5>
                                        <span className={`badge ${promo.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                            {promo.status}
                                        </span>
                                    </div>
                                    <p className="card-text text-muted small mb-3" style={{ minHeight: '40px' }}>
                                        {promo.description?.length > 100 ? promo.description.substring(0, 100) + '...' : promo.description}
                                    </p>
                                    
                                    <div className="mb-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="fw-bold">Type:</span>
                                            <span>{promo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="fw-bold">Value:</span>
                                            <span>{promo.discountValue}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold">Valid:</span>
                                            <span>{promo.startDate} - {promo.endDate}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                                        <div className="d-flex gap-3 text-muted small">
                                            <span title="Views"><i className="bi bi-eye me-1"></i> {promo.viewCount || 0}</span>
                                            <span title="Likes"><i className="bi bi-heart me-1"></i> {promo.likeCount || 0}</span>
                                        </div>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-success" onClick={() => handlePreview(promo)} title="Send">
                                                <i className="bi bi-whatsapp"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(promo)} title="Edit">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(promo.id)} title="Delete">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {promotions.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <p className="text-muted">No promotions found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            )}

            {showPreview && previewPromo && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">WhatsApp Notification Preview</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPreview(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="card">
                                    {previewPromo.imageUrl && (
                                        <img 
                                            src={`${API_BASE_URL}/uploads/${previewPromo.imageUrl}`} 
                                            className="card-img-top" 
                                            alt="Promotion"
                                            style={{ maxHeight: '200px', objectFit: 'cover' }} 
                                        />
                                    )}
                                    <div className="card-body bg-light">
                                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                                            Check out this new promotion: {previewPromo.description}
                                            <br />
                                            <br />
                                            View & Like here: {window.location.origin}/promotions/{previewPromo.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 text-muted small">
                                    <i className="bi bi-info-circle me-1"></i>
                                    This message will be sent to all subscribed consumers.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Cancel</button>
                                <button type="button" className="btn btn-success" onClick={confirmSend}>
                                    <i className="bi bi-whatsapp me-2"></i> Send Now
                                </button>
                            </div>
                        </div>
                    </div>
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