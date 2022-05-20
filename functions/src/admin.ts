import * as admin from 'firebase-admin';
admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();
const auth = admin.auth();
const storage = admin.storage().bucket('gs://cecdbfirebase.appspot.com');

export { admin, db, rtdb, auth, storage }
