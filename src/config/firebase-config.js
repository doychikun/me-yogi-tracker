// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyCryj0eL2AH1WVOrndAktuC05S-M-iBD0I",
  authDomain: "meyogi-6924a.firebaseapp.com",
  projectId: "meyogi-6924a",
  storageBucket: "meyogi-6924a.firebasestorage.app",
  messagingSenderId: "590609490430",
  appId: "1:590609490430:web:12eeecfec0b013797420af",
  measurementId: "G-B6KH3WF2NX",
  databaseURL:
    "https://meyogi-6924a-default-rtdb.europe-west1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// the Firebase authentication handler
export const auth = getAuth(app);

// the Realtime Database handler
export const db = getDatabase(app);

// the Analytics handler
export const analytics = getAnalytics(app);
