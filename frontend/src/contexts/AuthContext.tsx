import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';
import SkeletonLoading from '../components/SkeletonLoading';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      setUser(sessionUser);
      setLoading(false);
    };

    fetchUser();

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Error signing in:', error);
        toast.error(`Failed to sign in: ${error.message}`);
        throw error;
      } else {
        toast.success('Successfully signed in!', { duration: 4000 });
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error(`Failed to sign out: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`An unexpected error occurred during sign out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithEmail,
      logout,
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <SkeletonLoading />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
