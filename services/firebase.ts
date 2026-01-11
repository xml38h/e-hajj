import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔴 عدّل القيم من Firebase Console حقك
const firebaseConfig = {
  apiKey: "AIzaSyBVNMblJ4knyLSE6hAPdqhrDTmLnbS-9iE",
  authDomain: "hajjprofile.firebaseapp.com",
  projectId: "hajjprofile",
  storageBucket: "hajjprofile.firebasestorage.app",
  messagingSenderId: "500389579396",
  appId: "1:500389579396:web:74221a8b4f001d8c7a4e5d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ هذا المهم
export const db = getFirestore(app);
