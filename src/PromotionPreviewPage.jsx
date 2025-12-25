import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PromotionService from './PromotionService';

const PromotionPreviewPage = () => {
    const { id } = useParams();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const response = await PromotionService.getPromotionById(id);
                setPromotion(response.data);
                // Track view on load
                await PromotionService.trackView(id);
            } catch (error) {
                console.error("Error fetching promotion", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotion();
    }, [id]);

    const handleLike = async () => {
        if (liked) return;
        try {
            await PromotionService.trackLike(id);
            setLiked(true);
            setPromotion(prev => ({ ...prev, likeCount: (prev.likeCount || 0) + 1 }));
        } catch (error) {
            console.error("Error liking promotion", error);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!promotion) return <div className="text-center mt-5">Promotion not found</div>;

    // Assuming backend serves uploads at this path
    const imageUrl = promotion.imageUrl ? `http://localhost:8080/uploads/${promotion.imageUrl}` : null;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
                {imageUrl && (
                    <img 
                        src={imageUrl} 
                        className="card-img-top" 
                        alt={promotion.description} 
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                    />
                )}
                <div className="card-body">
                    <h5 className="card-title text-primary">{promotion.code}</h5>
                    <p className="card-text">{promotion.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                            <i className="bi bi-eye me-1"></i> {promotion.viewCount || 0} Views
                        </div>
                        <button className={`btn ${liked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={handleLike} disabled={liked}>
                            <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i> {promotion.likeCount || 0} Likes
                        </button>
                    </div>
                    <div className="mt-3 text-muted small">Valid until: {promotion.endDate}</div>
                </div>
            </div>
        </div>
    );
};

export default PromotionPreviewPage;