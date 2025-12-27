import React, { useState, useEffect } from 'react';
import VendorService from '../../VendorService';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';

const VendorAnalytics = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState({
        totalPromotions: 0,
        activePromotions: 0,
        totalViews: 0,
        totalLikes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.vendorId) {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const response = await VendorService.getVendorAnalytics(user.vendorId);
            setAnalytics(response.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
            toast.error("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    return (
        <div className="container-fluid p-4">
            <h3 className="mb-4">Dashboard Overview</h3>
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <h5 className="card-title"><i className="bi bi-tags-fill me-2"></i>Total Promotions</h5>
                            <p className="display-4 fw-bold mb-0">{analytics.totalPromotions}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <h5 className="card-title"><i className="bi bi-check-circle-fill me-2"></i>Active</h5>
                            <p className="display-4 fw-bold mb-0">{analytics.activePromotions}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <h5 className="card-title"><i className="bi bi-eye-fill me-2"></i>Total Views</h5>
                            <p className="display-4 fw-bold mb-0">{analytics.totalViews}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning h-100 shadow-sm">
                        <div className="card-body d-flex flex-column justify-content-between">
                            <h5 className="card-title"><i className="bi bi-heart-fill me-2"></i>Total Likes</h5>
                            <p className="display-4 fw-bold mb-0">{analytics.totalLikes}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAnalytics;