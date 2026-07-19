// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBEbIhBhnavQ96k9vMP6randuXnQWgznI",
  authDomain: "storepass-e4a43.firebaseapp.com",
  projectId: "storepass-e4a43",
  storageBucket: "storepass-e4a43.firebasestorage.app",
  messagingSenderId: "1019199433165",
  appId: "1:1019199433165:web:cf8c3180c8b7dd111f7c84",
  measurementId: "G-BSNXLPRDHH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics needs browser APIs it doesn't have in SSR/test environments —
// isSupported() guards against throwing there. Not used by the app itself;
// this only powers the Firebase console's own usage dashboards.
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
