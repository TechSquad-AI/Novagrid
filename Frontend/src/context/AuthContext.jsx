import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

// Local auth storage (works without Supabase)
const LOCAL_USERS_KEY = 'novagrid_users'
const LOCAL_SESSION_KEY = 'novagrid_session'

function getLocalUsers() {
    try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || {}; }
    catch { return {}; }
}

function saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getLocalSession() {
    try { return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY)); }
    catch { return null; }
}

function saveLocalSession(user) {
    if (user) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [useLocal, setUseLocal] = useState(false)

    useEffect(() => {
        // Try Supabase first
        if (supabase?.auth) {
            supabase.auth.getSession().then(({ data: { session }, error }) => {
                if (error || !session) {
                    // Fall back to local auth
                    const localSession = getLocalSession();
                    if (localSession) {
                        setUser(localSession);
                        setUseLocal(true);
                    }
                } else {
                    setUser(session.user);
                }
                setLoading(false);
            }).catch(() => {
                // Supabase unavailable, use local
                const localSession = getLocalSession();
                if (localSession) setUser(localSession);
                setUseLocal(true);
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });
            return () => subscription.unsubscribe();
        } else {
            // No Supabase, use local
            const localSession = getLocalSession();
            if (localSession) setUser(localSession);
            setUseLocal(true);
            setLoading(false);
        }
    }, []);

    const signUp = async (email, password) => {
        // Try Supabase first
        if (supabase?.auth && !useLocal) {
            try {
                const result = await supabase.auth.signUp({ email, password });
                if (!result.error) return result;
            } catch (e) { /* fall through to local */ }
        }

        // Local signup
        const users = getLocalUsers();
        if (users[email]) {
            return { error: { message: "User already exists. Please login." } };
        }
        users[email] = { email, password, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        saveLocalUsers(users);

        const localUser = { id: users[email].id, email, user_metadata: {} };
        saveLocalSession(localUser);
        setUser(localUser);
        setUseLocal(true);
        return { error: null };
    };

    const signIn = async (email, password) => {
        // Try Supabase first
        if (supabase?.auth && !useLocal) {
            try {
                const result = await supabase.auth.signInWithPassword({ email, password });
                if (!result.error) return result;
            } catch (e) { /* fall through to local */ }
        }

        // Local signin
        const users = getLocalUsers();
        const found = users[email];
        if (!found || found.password !== password) {
            return { error: { message: "Invalid email or password. Sign up first if you don't have an account." } };
        }

        const localUser = { id: found.id, email, user_metadata: {} };
        saveLocalSession(localUser);
        setUser(localUser);
        setUseLocal(true);
        return { error: null };
    };

    const signOut = async () => {
        if (supabase?.auth && !useLocal) {
            try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
        }
        saveLocalSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
