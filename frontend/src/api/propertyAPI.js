import API from './axiosInstance';

export const getProperties = (params = {}) => API.get('/properties/', {params});
export const getPropertyById = (id) => API.get(`/properties/${id}/`);
export const getFeatured = () => API.get('/properties/featured/');

export const createProperty = (formData) =>
    API.post('/properties/', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });

export const updateProperty = (id, formData) =>
    API.patch(`/properties/${id}/`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });

export const deleteProperty = (id) => API.delete(`/properties/${id}/`);
export const getMyProperties = () => API.get('/properties/mine/');

export const uploadImages = (id, formData) =>
    API.post(`/properties/${id}/images/`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });

export const deleteImage = (imageId) => API.delete(`/properties/images/${imageId}/delete/`);

export const getWishlist = () => API.get('/properties/wishlist/');
export const toggleWishlist = (id) => API.post(`/properties/${id}/wishlist/`);

export const approveProperty = (id) => API.post(`/properties/${id}/approve/`);
export const rejectProperty = (id) => API.post(`/properties/${id}/reject/`);
