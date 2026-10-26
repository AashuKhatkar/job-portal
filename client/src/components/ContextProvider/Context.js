import React, { createContext, useState, useEffect } from 'react';
import { api } from '../../utils/api';

export const LoginContext = createContext(null);

export const Context = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('ats_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem('ats_token') || '');
    const [loading, setLoading] = useState(false);

    const loginWithCredentials = async (email, password) => {
        setLoading(true);
        try {
            const data = await api.login(email, password);
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('ats_user', JSON.stringify(data.user));
            localStorage.setItem('ats_token', data.token);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken('');
        localStorage.removeItem('ats_user');
        localStorage.removeItem('ats_token');
    };

    // 1-Click quick login for testing/demo evaluation
    const quickLogin = async (role) => {
        const credentials = {
            candidate: { email: 'candidate@example.com', pass: 'Candidate@123' },
            recruiter: { email: 'recruiter@example.com', pass: 'Recruiter@123' },
            admin: { email: 'admin@example.com', pass: 'Admin@123' }
        };

        const target = credentials[role];
        if (target) {
            return loginWithCredentials(target.email, target.pass);
        }
    };

    return (
        <LoginContext.Provider value={{
            user,
            setUser,
            token,
            loading,
            loginWithCredentials,
            logout,
            quickLogin,
            // legacy compatibility:
            loginData: user,
            setLoginData: setUser
        }}>
            {children}
        </LoginContext.Provider>
    );
};
