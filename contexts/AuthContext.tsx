
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { useData } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logActivity, setCurrentUserForLog } = useData();
  
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Synchronize the authenticated user with DataContext whenever 'user' state changes.
  // This ensures that DataContext knows the current actor for logging purposes (e.g. Attendance changes).
  useEffect(() => {
    if (user) {
      setCurrentUserForLog(user.id);
    } else {
      setCurrentUserForLog(null);
    }
  }, [user, setCurrentUserForLog]);

  const login = (role: Role) => {
    const userToLogin = MOCK_USERS.find(u => u.role === role);
    if (userToLogin) {
      // Update local state
      setUser(userToLogin);
      localStorage.setItem('authUser', JSON.stringify(userToLogin));
      
      // Explicitly set user for log immediately before logging
      setCurrentUserForLog(userToLogin.id);
      
      // Log activity (using the correct signature: action, details)
      const ip = `88.6.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      logActivity('Inicio de sesión', `IP: ${ip}`);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    setCurrentUserForLog(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
