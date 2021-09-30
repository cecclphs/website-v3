import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore, Timestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
    apiKey: "AIzaSyCpWeoGzDrwoJjnsjBnDu-vVUt6LfGHyxk",
    authDomain: "cecdbfirebase.firebaseapp.com",
    databaseURL: "https://cecdbfirebase.firebaseio.com",
    projectId: "cecdbfirebase",
    storageBucket: "cecdbfirebase.appspot.com",
    messagingSenderId: "497574235952",
    appId: "1:497574235952:web:1f9d500879e89a6de802f5",
    measurementId: "G-VKVL0EP36N"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

// Get all the services we'll use in this app, then export them
const auth = getAuth(firebase)
const db = getFirestore(firebase);
const rtdb = getDatabase(firebase);
const now = Timestamp.now();
let analytics;

if(process.browser){
    analytics = getAnalytics(firebase);
}

export { firebase, auth, db, now, rtdb, analytics };

console.log(firebase.name ? 'Firebase Mode Activated!' : 'Firebase not working :(');