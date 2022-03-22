import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { DocumentData, DocumentReference, FirestoreDataConverter, getFirestore, QueryDocumentSnapshot, SnapshotOptions, Timestamp, WithFieldValue } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

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
const functions = getFunctions(firebase);
const now = Timestamp.now();
let analytics;

if(process.browser){
    analytics = getAnalytics(firebase);
}

export { firebase, auth, db, now, rtdb, functions, analytics };

console.log(firebase.name ? 'Firebase Mode Activated!' : 'Firebase not working :(');

export const docConverter = {
    toFirestore(doc: WithFieldValue<any>): DocumentData {
        const { id, ref, ...docWithoutId } = doc;
        return docWithoutId;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): {
      id: string,
      ref: DocumentReference,
      [x: string]: any
    } {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ref: snapshot.ref,
        ...data,
      };
    },
  };