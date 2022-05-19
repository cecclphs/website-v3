import * as admin from 'firebase-admin';
import { DocumentData, DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const adminConfig = {
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

if (!admin.apps.length) {
  admin.initializeApp(adminConfig);
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminRtdb = admin.database();
const adminStorage = admin.storage().bucket('gs://cecdbfirebase.appspot.com');

export const adminConverter:FirestoreDataConverter<any> = {
  toFirestore(doc: any): DocumentData {
      const { id, ref, ...docWithoutId } = doc;
      return docWithoutId;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
  ): {
    id: string,
    ref: DocumentReference,
    [x: string]: any
  } {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ref: snapshot.ref,
      ...data,
    };
  },
};

export { adminDb, adminAuth, adminRtdb, adminStorage, admin, adminConfig }
