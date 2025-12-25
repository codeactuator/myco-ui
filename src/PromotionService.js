import axios from 'axios';
import API_BASE_URL from './config';

const PROMOTION_API_URL = `${API_BASE_URL}/v1/promotions`;

class PromotionService {
    getPromotionsByVendor(vendorId) {
        return axios.get(`${PROMOTION_API_URL}/vendor/${vendorId}`);
    }

    getPromotionById(id) {
        return axios.get(`${PROMOTION_API_URL}/${id}`);
    }

    createPromotion(promotion) {
        return axios.post(PROMOTION_API_URL, promotion);
    }

    updatePromotion(id, promotion) {
        return axios.put(`${PROMOTION_API_URL}/${id}`, promotion);
    }

    deletePromotion(id) {
        return axios.delete(`${PROMOTION_API_URL}/${id}`);
    }

    sendPromotion(id) {
        return axios.post(`${PROMOTION_API_URL}/${id}/send`);
    }

    trackView(id) {
        return axios.post(`${PROMOTION_API_URL}/${id}/view`);
    }

    trackLike(id) {
        return axios.post(`${PROMOTION_API_URL}/${id}/like`);
    }
}

export default new PromotionService();