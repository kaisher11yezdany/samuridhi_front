import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getUnreadCount } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [unreadCount, setUnread]  = useState(0);

  const refreshUnread = useCallback(() => {
    getUnreadCount()
      .then(r => setUnread(r.data.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      refreshUnread();
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    const { token, user: u } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    setTimeout(refreshUnread, 200);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnread(0);
  };

  // Helper: get permission scope for a module + action
  // Falls back to role-based defaults if no custom permissions set
  const getScope = (module, action = 'view') => {
    if (user?.permissions?.[module]?.[action]) return user.permissions[module][action];
    const role = user?.role;
    if (!role) return 'none';
    if (['Super Admin', 'Management'].includes(role)) return 'all';
    if (role === 'Project Manager') {
      if (action === 'delete') return 'none';
      return 'all';
    }
    if (role === 'Technician') {
      if (['breakdown', 'maintenance'].includes(module) && (action === 'view' || action === 'edit')) return 'own';
      if (['dashboard', 'notifications', 'spareparts'].includes(module) && action === 'view') return 'all';
      return 'none';
    }
    return 'none';
  };

  const can = (module, action = 'view') => getScope(module, action) !== 'none';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, unreadCount, refreshUnread, getScope, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
