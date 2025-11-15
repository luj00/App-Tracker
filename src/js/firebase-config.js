// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2VVeipmIoAHzz7k69ZbSMDf21etHoIUQ",
  authDomain: "luna-3a4b2.firebaseapp.com",
  databaseURL: "https://luna-3a4b2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "luna-3a4b2",
  storageBucket: "luna-3a4b2.firebasestorage.app",
  messagingSenderId: "534672966494",
  appId: "1:534672966494:web:b19a4e6055361c7ae805cf",
  measurementId: "G-ND360Y6KLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };