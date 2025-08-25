// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDfyQEPAyT60t1suyGTK6WN85KTtuNeXyM",
  authDomain: "hariharan-portfolio-6b3yt.firebaseapp.com",
  projectId: "hariharan-portfolio-6b3yt",
  storageBucket: "hariharan-portfolio-6b3yt.appspot.com",
  messagingSenderId: "541714079704",
  appId: "1:541714079704:web:ad0514d8cdbf7f2804dcad"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
