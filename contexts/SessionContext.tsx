"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'OPERATOR' | 'USER';
    phoneNumber?: string;
    telegramId?: string;
    [key: string]: any;
}

interface SessionContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setSession: (user: User, token?: string | null) => void;
    clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }

        setIsLoading(false);
    }, []);

    const setSession = (newUser: User, newToken?: string | null) => {
        setUser(newUser);
        const tokenValue = newToken || "cookie";
        setToken(tokenValue);
        localStorage.setItem("auth_token", tokenValue);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
    };

    const clearSession = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <SessionContext.Provider value={{ user, token, isLoading, setSession, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSessionContext() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
}
