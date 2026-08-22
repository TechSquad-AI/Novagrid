import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved session
        const saved = localStorage.getItem("novagrid_user");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch {
                localStorage.removeItem("novagrid_user");
            }
        }
        setLoading(false);
    }, []);

    const saveUser = (userData) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem("novagrid_user", JSON.stringify(userData));
        } else {
            localStorage.removeItem("novagrid_user");
            localStorage.removeItem("novagrid_token");
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        saveUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
