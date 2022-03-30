import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminRtdb = admin.database();
const adminStorage = admin.storage().bucket('gs://cecdbfirebase.appspot.com');

export { adminDb, adminAuth, adminRtdb, adminStorage, admin }
