import React, { useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { logout as apiLogout } from '../api';
import { AuthContext } from './auth';
import type { User } from './auth';

// Helper to get a cookie value by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Decoded JWT payload structure
interface DecodedToken {
  username: string;
  role: string;
  exp: number;
  // Add other fields from your JWT payload if needed
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = getCookie('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          return { username: decodedToken.username, role: decodedToken.role };
        }
      } catch (error) {
        console.error('Invalid token found:', error);
        return null;
      }
    }
    return null;
  });

  const login = (token: string) => {
    console.log(`userlogin`)
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      // Set user state from decoded token
      setUser({ username: decodedToken.username, role: decodedToken.role });
      // Set token in cookie, valid for 1 day
      document.cookie = `token=${token}; path=/; max-age=86400;`;
    } catch (error) {
      console.error('Failed to decode token on login:', error);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed", error);
    }
    // Expire the 'token' cookie to log out
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
