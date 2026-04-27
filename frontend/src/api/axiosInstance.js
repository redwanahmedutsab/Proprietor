import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {'Content-Type': 'application/json'},
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        error ? prom.reject(error) : prom.resolve(token);
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return API(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const {data} = await axios.post(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
                    {refresh: refreshToken}
                );

                localStorage.setItem('access_token', data.access);
                API.defaults.headers.common.Authorization = `Bearer ${data.access}`;
                processQueue(null, data.access);
                return API(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
