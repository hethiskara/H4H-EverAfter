import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '756931726833-goc88ve1gitduabh3acm6t9223chhfb4.apps.googleusercontent.com',
  });

  useEffect(() => {
    console.log('[Auth] Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[Auth] Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('[Auth] Google sign-in successful, getting credential...');
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => console.log('[Auth] Firebase credential sign-in successful'))
        .catch((err) => console.error('[Auth] Firebase credential error:', err));
    } else if (response) {
      console.log('[Auth] Google response type:', response.type);
    }
  }, [response]);

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Attempting email sign-in for:', email);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Email sign-in successful');
    } catch (error: any) {
      console.error('[Auth] Sign-in error:', error.message);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign-up for:', email);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Sign-up successful');
    } catch (error: any) {
      console.error('[Auth] Sign-up error:', error.message);
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    console.log('[Auth] Signing out...');
    try {
      await firebaseSignOut(auth);
      console.log('[Auth] Sign-out successful');
    } catch (error: any) {
      console.error('[Auth] Sign-out error:', error.message);
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] Initiating Google sign-in...');
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('[Auth] Google sign-in error:', error.message);
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
