// src/firebase.js
// Sets up Firebase for the app. These config values are safe in front-end code —
// Firebase security comes from Authentication + Firestore rules, not from hiding these.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVnxg1k5nsnAgXnbLKejt3YMG0a2b_JbA",
  authDomain: "sharecompass-1e468.firebaseapp.com",
  projectId: "sharecompass-1e468",
  storageBucket: "sharecompass-1e468.firebasestorage.app",
  messagingSenderId: "645876724431",
  appId: "1:645876724431:web:573729fcf03a951b7f3dba",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
