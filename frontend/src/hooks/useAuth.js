// src/hooks/useAuth.js
// Clean hook to consume AuthContext anywhere in the app

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
};

export default useAuth;
