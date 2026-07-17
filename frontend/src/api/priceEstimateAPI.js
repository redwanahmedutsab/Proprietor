import axios from 'axios';

// Separate, unauthenticated client — the ML service is a standalone
// container (no JWT auth needed) so we don't reuse the main axiosInstance.
const ML_API = axios.create({
    baseURL: process.env.REACT_APP_ML_API_URL || 'http://localhost:8001',
    headers: {'Content-Type': 'application/json'},
});

export const getPriceMetadata = () => ML_API.get('/metadata');

export const predictSalePrice = (payload) => ML_API.post('/predict/sale', payload);

export const predictRentPrice = (payload) => ML_API.post('/predict/rent', payload);

export default ML_API;
