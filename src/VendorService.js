import axios from 'axios';
import API_BASE_URL from './config';

const VendorService = {
    getVendor: (vendorId) => {
        return axios.get(`${API_BASE_URL}/v1/vendors/${vendorId}`);
    },
    getVendorAnalytics: (vendorId) => {
        return axios.get(`${API_BASE_URL}/v1/vendors/${vendorId}/analytics`);
    },
    getVendorProducts: (vendorId) => {
        return axios.get(`${API_BASE_URL}/v1/products/vendor/${vendorId}`);
    }
};

export default VendorService;