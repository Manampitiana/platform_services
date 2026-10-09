import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient()

    useEffect(() => {
        authApi
            .me()
            .then((res) => setUser(res.data.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, []);

    // Lany ny session → mivoaka ; tsy voamarina ny e-mail → havaozy ny user (mivadika any /verify-email)
    useEffect(() => {
        const onExpired = () => {
            setUser(null)
            queryClient.clear()
        }

        const onUnverified = () => {
            authApi
                .me()
                .then((res) => setUser(res.data.data))
                .catch(() => { })
        }

        window.addEventListener('auth:expired', onExpired)
        window.addEventListener('auth:unverified', onUnverified)

        return () => {
            window.removeEventListener('auth:expired', onExpired)
            window.removeEventListener('auth:unverified', onUnverified)
        }
    }, [queryClient])

    const login = useCallback(async (credentials) => {
        const res = await authApi.login(credentials)
        setUser(res.data.data)
        return res.data.data
    }, []);

    const register = useCallback(async (payload) => {
        const res = await authApi.register(payload)
        setUser(res.data.data)
        return res.data.data
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout()
        } catch {
            /* efa lany ny session: tsy olana */
        }
        setUser(null)
        queryClient.clear()
    }, [queryClient])

    const value = {
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVerified: !!user?.email_verified_at,
        login,
        register,
        logout,
    }

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}