import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/adapters';
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
      try {
        const sessionUser = await auth.getCurrentUser();
        setUser(sessionUser);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const unsubscribe = auth.onAuthStateChange((sessionUser) => {
      setUser(sessionUser);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const signedInUser = await auth.signInWithEmail(email, password);
      toast.success('Successfully signed in!', { duration: 4000 });
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
      await auth.logout();
      toast.success('Successfully signed out!');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Failed to sign out: ${error.message}`);
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
