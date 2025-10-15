// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjSJvgzLlCkUOhQoKi4RXDuHqH4A30bM8",
  authDomain: "reliefsync-46fbb.firebaseapp.com",
  projectId: "reliefsync-46fbb",
  storageBucket: "reliefsync-46fbb.firebasestorage.app",
  messagingSenderId: "224396820099",
  appId: "1:224396820099:web:3a62992af9ce75417fe5b6",
  measurementId: "G-J5Q8N8JK95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

