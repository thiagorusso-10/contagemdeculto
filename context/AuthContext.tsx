import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: 'admin' | 'global_viewer' | 'campus_leader' | null;
    assignedCampusId: string | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<'admin' | 'global_viewer' | 'campus_leader' | null>(null);
    const [assignedCampusId, setAssignedCampusId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async () => {
        try {
            const { data, error } = await supabase.rpc('get_my_role');
            if (error) throw error;
            if (data) {
                setRole(data.role as any);
                setAssignedCampusId(data.campus_id);
            }
        } catch (err) {
            console.error('Error fetching role:', err);
            // Default to minimal access if fails or no role
            setRole(null);
            setAssignedCampusId(null);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole().finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // If logging in, fetch role
                setLoading(true); // Show loading while fetching role
                fetchUserRole().finally(() => setLoading(false));
            } else {
                setRole(null);
                setAssignedCampusId(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async () => {
        // ...
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setAssignedCampusId(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, role, assignedCampusId, loading, signIn, signOut }}>
            {!loading ? children : <div className="flex items-center justify-center h-screen bg-neo-bg font-bold animate-pulse">CARREGANDO SISTEMA...</div>}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
