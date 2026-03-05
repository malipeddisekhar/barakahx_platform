import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('barakahx_token');
        const saved = localStorage.getItem('barakahx_user');
        if (token && saved) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                localStorage.removeItem('barakahx_token');
                localStorage.removeItem('barakahx_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('barakahx_token', data.token);
        localStorage.setItem('barakahx_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user; // caller uses user.role to redirect
    };

    const register = async (username, email, password, role = 'user') => {
        const { data } = await api.post('/auth/register', { username, email, password, role });
        localStorage.setItem('barakahx_token', data.token);
        localStorage.setItem('barakahx_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('barakahx_token');
        localStorage.removeItem('barakahx_user');
        setUser(null);
    };

    const updateProfile = async (payload) => {
        const { data } = await api.patch('/auth/me', payload);
        const updated = { ...user, ...data };
        localStorage.setItem('barakahx_user', JSON.stringify(updated));
        setUser(updated);
        return updated;
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be inside <AuthProvider>');
    return ctx;
}
