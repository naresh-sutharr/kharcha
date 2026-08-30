import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Enable offline persistence so the app loads INSTANTLY from cache
// and syncs in the background when network is available
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence works in only one tab at a time
    console.warn('Firestore persistence unavailable (multiple tabs)');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support offline persistence
    console.warn('Firestore persistence not supported in this browser');
  }
});
