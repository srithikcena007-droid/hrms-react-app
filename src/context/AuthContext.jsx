import React, { createContext, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login: query employees table by email + password
  const login = async (email, password) => {
    // Debug: check if env vars are loaded
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET ✓' : 'MISSING ✗');
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET ✓' : 'MISSING ✗');

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('Login error:', error?.message, '| Code:', error?.code, '| Details:', error?.details);
      const msg = error?.code === 'PGRST116' 
        ? 'No account found with those credentials.'
        : error?.message?.includes('fetch') || error?.message?.includes('network')
        ? 'Cannot reach the database. Check Supabase environment variables in Vercel.'
        : 'Invalid email or password.';
      return { success: false, message: msg };
    }

    setUser(data);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : prev);
  };

  // Update password in Supabase
  const updatePassword = async (newPassword) => {
    if (!user) return { success: false, message: 'Not logged in.' };
    const { error } = await supabase
      .from('employees')
      .update({ password: newPassword })
      .eq('id', user.id);

    if (error) return { success: false, message: error.message };
    setUser({ ...user, password: newPassword });
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
