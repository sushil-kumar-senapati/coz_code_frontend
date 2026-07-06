import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user || parsed;
      } catch { return null; }
    }
    return null;
  });

  const login = async (phone, password) => {
    const data = await loginUser({ phone, password });
    const userData = { ...data.user, token: data.access_token };
    setUser(userData);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    return userData;
  };

  const register = async ({ phone, password, name, home_pin_code, home_constituency }) => {
    const data = await registerUser({ phone, password, name, home_pin_code, home_constituency });
    const userData = { ...data.user, token: data.access_token };
    setUser(userData);
    localStorage.setItem('pp_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isMp: user?.role === 'mp' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
