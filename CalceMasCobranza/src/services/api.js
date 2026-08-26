import axios from 'axios';
import { store } from '../app/store';

const api = axios.create({
    baseURL: '/', // O tu base URL
    timeout: 300000, // Timeout de 120 segundos
});

api.interceptors.request.use(
    (config) => {
        const token = store.getState().user.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
