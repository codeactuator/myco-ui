import axios from 'axios';
import API_BASE_URL from './config';

const USER_API_URL = `${API_BASE_URL}/v1/admin/system-users`;
const AUTH_API_URL = `${API_BASE_URL}/v1/auth`;

class UserService {
    
    login(credentials) {
        return axios.post(`${AUTH_API_URL}/login`, credentials);
    }

    createUser(userData) {
        // Add Authorization headers here if needed
        return axios.post(USER_API_URL, userData);
    }

    getAllUsers() {
        return axios.get(USER_API_URL);
    }

    updateUser(id, userData) {
        return axios.put(`${USER_API_URL}/${id}`, userData);
    }

    deleteUser(id) {
        return axios.delete(`${USER_API_URL}/${id}`);
    }

    toggleUserStatus(id) {
        return axios.patch(`${USER_API_URL}/${id}/status`);
    }
}

export default new UserService();