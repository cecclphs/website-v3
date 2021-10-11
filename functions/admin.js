const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();
const auth = admin.auth();

module.exports = { admin, db, rtdb, auth }
