import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3IEGtusP6MtVMSvA1e32BsFl_xG2sDOU",
  authDomain: "project-2f69f.firebaseapp.com",
  projectId: "project-2f69f",
  storageBucket: "project-2f69f.firebasestorage.app",
  messagingSenderId: "949858850463",
  appId: "1:949858850463:web:cb6e41046126783344b4aa",
  measurementId: "G-PZ69KB9PWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
