import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBVNMblJ4knyLSE6hAPdqhrDTmLnbS-9iE',
  authDomain: 'hajjprofile.firebaseapp.com',
  projectId: 'hajjprofile', // ← مهم
  storageBucket: 'hajjprofile.firebasestorage.app',
  messagingSenderId: '500389579396',
  appId: '1:500389579396:web:74221a8b4f001d8c7a4e5d',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
