import API from './axiosInstance';

export const createBooking    = (data)      => API.post('/bookings/', data);
export const getMyBookings    = ()          => API.get('/bookings/mine/');
export const getBookingById   = (id)        => API.get(`/bookings/${id}/`);
export const cancelBooking    = (id)        => API.post(`/bookings/${id}/cancel/`);

export const initiatePayment  = (bookingId) => API.post(`/payments/initiate/${bookingId}/`);
export const getPaymentStatus = (bookingId) => API.get(`/payments/status/${bookingId}/`);
