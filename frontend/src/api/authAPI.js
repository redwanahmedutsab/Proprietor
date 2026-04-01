// src/api/authAPI.js
// All authentication-related API calls

import API from './axiosInstance';

/**
 * Register a new user account.
 * @param {Object} data - { username, email, first_name, last_name, phone, address, role, password, password2 }
 */
export const registerUser = (data) =>
  API.post('/auth/register/', data);

/**
 * Login with email + password.
 * Returns { access, refresh } tokens.
 * @param {Object} data - { email, password }
 */
export const loginUser = (data) =>
  API.post('/auth/login/', data);

/**
 * Logout — blacklists the refresh token on the server.
 * @param {string} refreshToken
 */
export const logoutUser = (refreshToken) =>
  API.post('/auth/logout/', { refresh: refreshToken });

/**
 * Get the authenticated user's profile.
 */
export const getProfile = () =>
  API.get('/auth/profile/');

/**
 * Update the authenticated user's profile (partial update).
 * @param {Object} data - any subset of profile fields
 */
export const updateProfile = (data) =>
  API.patch('/auth/profile/', data);

/**
 * Change password.
 * @param {Object} data - { old_password, new_password, new_password2 }
 */
export const changePassword = (data) =>
  API.post('/auth/change-password/', data);

/**
 * Refresh access token using a refresh token.
 * @param {string} refreshToken
 */
export const refreshAccessToken = (refreshToken) =>
  API.post('/auth/token/refresh/', { refresh: refreshToken });
