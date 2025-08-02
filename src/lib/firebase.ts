// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "hariharan-portfolio-6b3yt",
  appId: "1:541714079704:web:ad0514d8cdbf7f2804dcad",
  storageBucket: "hariharan-portfolio-6b3yt.firebasestorage.app",
  apiKey: "AIzaSyDfyQEPAyT60t1suyGTK6WN85KTtuNeXyM",
  authDomain: "hariharan-portfolio-6b3yt.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "541714079704"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
