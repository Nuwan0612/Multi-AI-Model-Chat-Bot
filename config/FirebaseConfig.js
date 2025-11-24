// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "multi-ai-app.firebaseapp.com",
  projectId: "multi-ai-app",
  storageBucket: "multi-ai-app.firebasestorage.app",
  messagingSenderId: "224494321842",
  appId: "1:224494321842:web:dd888e8eaabbc2887a09ab",
  measurementId: "G-8D1PBF1MZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)

console.log("Firebase initialized:", app ? "YES" : "NO");