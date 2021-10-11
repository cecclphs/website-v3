const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.getOldUserData = functions.https.onCall(async (data, context) => {
    const { uid } = context.auth;
    const { email } = context.auth.token;
    //Check if email is student email, else don't give a fck
    if(!/(s[0-9]{5}@clphs.edu.my)/g.test(email)) throw new functions.https.HttpsError("permission-denied", "You are not a student");
    
    //Fetch user existing data, if snapshot is empty, throw error
    const studentid = email.substr(1,5);
    const studentSnap = await db.collection("users")
                                .where('studentid','==',studentid)
                                .get();
    if(studentSnap.empty) throw new functions.https.HttpsError("not-found", "Student not found");

    //If user document id is the same as this uid, throw same user error
    if(studentSnap.docs[0].id === uid) throw new functions.https.HttpsError("permission-denied", "You are the same user");
    
    //Get user and omit useless data
    const studentData = studentSnap.docs[0].data();
    const { _ft_updatedAt, _ft_updatedBy, photoURL, userGroup, permission, ...rest } = studentData; 
    return rest;
});
  