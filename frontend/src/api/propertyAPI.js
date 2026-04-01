// src/api/propertyAPI.js
// All property-related API calls

import API from './axiosInstance';

// ── Public ────────────────────────────────────────────────

/** List properties with optional filters.
 * @param {Object} params - { property_type, category, city, min_price, max_price,
 *                            bedrooms, search, ordering, page }
 */
export const getProperties    = (params = {}) => API.get('/properties/', { params });
export const getPropertyById  = (id)          => API.get(`/properties/${id}/`);
export const getFeatured      = ()            => API.get('/properties/featured/');

// ── Auth required ─────────────────────────────────────────

/** Create a new property listing (multipart/form-data for images). */
export const createProperty   = (formData)    =>
  API.post('/properties/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProperty   = (id, formData) =>
  API.patch(`/properties/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProperty   = (id)          => API.delete(`/properties/${id}/`);
export const getMyProperties  = ()            => API.get('/properties/mine/');

/** Upload additional images to existing property. */
export const uploadImages     = (id, formData) =>
  API.post(`/properties/${id}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteImage      = (imageId)     => API.delete(`/properties/images/${imageId}/delete/`);

// ── Wishlist ──────────────────────────────────────────────

export const getWishlist      = ()            => API.get('/properties/wishlist/');
export const toggleWishlist   = (id)          => API.post(`/properties/${id}/wishlist/`);

// ── Admin ─────────────────────────────────────────────────

export const approveProperty  = (id)          => API.post(`/properties/${id}/approve/`);
export const rejectProperty   = (id)          => API.post(`/properties/${id}/reject/`);
