import { initializeApp, getApps } from 'firebase/app';
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
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
