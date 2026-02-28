import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
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

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: '756931726833-goc88ve1gitduabh3acm6t9223chhfb4.apps.googleusercontent.com',
  });

  useEffect(() => {
    console.log('[Auth] Setting up listener');
    return onAuthStateChanged(auth, (u) => {
      console.log('[Auth] State changed:', u?.email || 'none');
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const credential = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, credential).catch(console.error);
    }
  }, [response]);

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Signing in:', email);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Signing up:', email);
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    console.log('[Auth] Signing out');
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] Google sign-in');
    await promptAsync();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
