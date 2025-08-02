// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDbd_ElhFwkQ_UuFMre_wBjvMpTlVfLkZ0",
  authDomain: "portfoliohariharanm.firebaseapp.com",
  projectId: "portfoliohariharanm",
  storageBucket: "portfoliohariharanm.firebasestorage.app",
  messagingSenderId: "201357903425",
  appId: "1:201357903425:web:84f088a3cf3caa3637a8c0",
  measurementId: "G-SS326RMLT3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
