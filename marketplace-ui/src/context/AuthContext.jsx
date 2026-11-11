import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stash_token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('stash_user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { token: jwt, nickName, role } = res.data;
    const userData = { nickName, role };

    localStorage.setItem('stash_token', jwt);
    localStorage.setItem('stash_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    await authApi.register(data);
    return await login({ identifier: data.email, password: data.password });
  };

  const logout = () => {
    localStorage.removeItem('stash_token');
    localStorage.removeItem('stash_user');
    setToken(null);
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);