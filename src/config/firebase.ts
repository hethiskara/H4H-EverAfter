import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBr6V-ZxVmkKv2B_pwy-7ACFHoJqQt5C8c",
  authDomain: "everafter-9ecf7.firebaseapp.com",
  projectId: "everafter-9ecf7",
  storageBucket: "everafter-9ecf7.firebasestorage.app",
  messagingSenderId: "756931726833",
  appId: "1:756931726833:web:63dd812fdc0dca8ccd8850",
};

const API_KEY = firebaseConfig.apiKey;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

interface AuthUser {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
}

async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  console.log('[Auth] Signing up:', email);
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message.replace(/_/g, ' '));
  const user: AuthUser = { uid: data.localId, email: data.email, idToken: data.idToken, refreshToken: data.refreshToken };
  await AsyncStorage.setItem('user', JSON.stringify(user));
  console.log('[Auth] Sign up success');
  return user;
}

async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  console.log('[Auth] Signing in:', email);
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message.replace(/_/g, ' '));
  const user: AuthUser = { uid: data.localId, email: data.email, idToken: data.idToken, refreshToken: data.refreshToken };
  await AsyncStorage.setItem('user', JSON.stringify(user));
  console.log('[Auth] Sign in success');
  return user;
}

async function signOutUser(): Promise<void> {
  console.log('[Auth] Signing out');
  await AsyncStorage.removeItem('user');
}

async function getCurrentUser(): Promise<AuthUser | null> {
  const stored = await AsyncStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
}

console.log('[Firebase] Initialized');

export { app, db, signUpWithEmail, signInWithEmail, signOutUser, getCurrentUser };
export type { AuthUser };
