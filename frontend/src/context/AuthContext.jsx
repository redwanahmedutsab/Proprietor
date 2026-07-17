import {createContext, useState, useEffect, useCallback} from 'react';
import {
    loginUser,
    logoutUser,
    getProfile,
    registerUser,
    sendRegistrationOTP,
    verifyRegistrationOTP,
} from '../api/authAPI';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);  // checking token on mount
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            getProfile()
                .then(({data}) => setUser(data))
                .catch(() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const sendOtp = useCallback(async (email) => {
        try {
            const {data} = await sendRegistrationOTP(email);
            return {success: true, retryAfter: data.retry_after};
        } catch (err) {
            const payload = err.response?.data || {};
            const msg = payload.error || payload.email?.[0] || 'Failed to send verification code.';
            return {success: false, error: msg, retryAfter: payload.retry_after};
        }
    }, []);

    const verifyOtp = useCallback(async (email, otpCode) => {
        try {
            await verifyRegistrationOTP(email, otpCode);
            return {success: true};
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid verification code.';
            return {success: false, error: msg};
        }
    }, []);

    const register = useCallback(async (formData) => {
        setError(null);
        try {
            const {data} = await registerUser(formData);
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            setUser(data.user);
            return {success: true};
        } catch (err) {
            const msg = err.response?.data || {error: 'Registration failed.'};
            setError(msg);
            return {success: false, errors: msg};
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const {data} = await loginUser({email, password});
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            const profile = await getProfile();
            setUser(profile.data);
            return {success: true};
        } catch (err) {
            const msg = err.response?.data?.detail || 'Invalid email or password.';
            setError(msg);
            return {success: false, error: msg};
        }
    }, []);

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        try {
            if (refreshToken) await logoutUser(refreshToken);
        } catch (_) {
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        }
    }, []);

    const updateUser = useCallback((updatedData) => {
        setUser((prev) => ({...prev, ...updatedData}));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                isAuthenticated: !!user,
                register,
                sendOtp,
                verifyOtp,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
