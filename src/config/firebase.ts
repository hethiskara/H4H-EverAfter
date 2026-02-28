import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBr6V-ZxVmkKv2B_pwy-7ACFHoJqQt5C8c",
  authDomain: "everafter-9ecf7.firebaseapp.com",
  projectId: "everafter-9ecf7",
  storageBucket: "everafter-9ecf7.firebasestorage.app",
  messagingSenderId: "756931726833",
  appId: "1:756931726833:web:63dd812fdc0dca8ccd8850",
  measurementId: "G-41MW2W02KY"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence for React Native
let auth: ReturnType<typeof getAuth>;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // Auth already initialized, get existing instance
  auth = getAuth(app);
}

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

console.log('[Firebase] Initialized successfully');

export { app, auth, db, storage, googleProvider };
