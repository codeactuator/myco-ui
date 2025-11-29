import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real app, the user would be null initially and set after login.
  // For demonstration, we'll start with a mock user.
  const [user, setUser] = useState(null);

  // Mock login function
  const login = (role) => {
    // In a real app, you'd get a token from your backend.
    // The token would contain the user's role.
    setUser({ name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`, role: role.toUpperCase() });
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};