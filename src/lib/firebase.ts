// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAxgdICrJm6prQ_lUZAuL5GlbTk5_BD238",
    authDomain: "retrospective-paltf.firebaseapp.com",
    projectId: "retrospective-paltf",
    storageBucket: "retrospective-paltf.firebasestorage.app",
    messagingSenderId: "776229433862",
    appId: "1:776229433862:web:7596a3bbbc08144ead8987"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;