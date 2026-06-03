import React, { createContext, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login: query employees table by email + password
  const login = async (email, password) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password', password)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid email or password.' };
    }

    setUser(data);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
