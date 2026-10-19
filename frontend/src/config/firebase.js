import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmm-1M30TxuXPGryZGfmC4HbEX3oyoMAs",
    authDomain: "smart-gd-02.firebaseapp.com",
    projectId: "smart-gd-02",
    storageBucket: "smart-gd-02.firebasestorage.app",
    messagingSenderId: "452737247902",
    appId: "1:452737247902:web:951200cfb9aa2b6ec6e98f",
    measurementId: "G-172JH64GH4"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const timestamp = serverTimestamp;
