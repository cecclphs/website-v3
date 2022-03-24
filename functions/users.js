const functions = require("firebase-functions");
const { db, auth, admin } = require("./admin");

const updateUserClaims = (uid, claims) => {
    db.doc(`user_claims/${uid}`).set(claims, { merge: true });
};

exports.claimsDocumentUpdate = functions.firestore
  .document("user_claims/{uid}")
  .onWrite(async (change, context) => {
    const beforeData = change.before.data() || {};
    const afterData = change.after.data() || {};
    // Skip updates where _lastCommitted field changed,
    // to avoid infinite loops
    const skipUpdate =
      beforeData._lastCommitted &&
      afterData._lastCommitted &&
      !beforeData._lastCommitted.isEqual(afterData._lastCommitted);
    if (skipUpdate) {
      console.log("No changes");
      return;
    }
    // Create a new JSON payload and check that it's under
    // the 1000 character max
    const { _lastCommitted, ...newClaims } = afterData;
    const stringifiedClaims = JSON.stringify(newClaims);
    if (stringifiedClaims.length > 1000) {
      console.error(
        "New custom claims object string > 1000 characters",
        stringifiedClaims
      );
      return;
    }
    const uid = context.params.uid;
    console.log(`Setting custom claims for ${uid}`, newClaims);
    await auth.setCustomUserClaims(uid, newClaims);
    console.log("Updating document timestamp");
    await change.after.ref.update({
      _lastCommitted: admin.firestore.FieldValue.serverTimestamp(),
      ...newClaims,
    });
    console.log("Updating user document");
    db.doc(`users/${uid}`).set({
      "_updatedOn": admin.firestore.FieldValue.serverTimestamp(),
      ...newClaims
    },{merge: true});
});

exports.initializeUser = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    const studentid = email.substring(1,5);
    //Create user document
    await db.collection("users").doc(uid).set({
      _firstLogin: admin.firestore.FieldValue.serverTimestamp(),
    })
    //Create user claims
    await updateUserClaims({
      englishName: "",
      chineseName: "",
      studentid: studentid,
      isAdmin: false,
      isCommittee: false,
      isStudent: /(s[0-9]{5}@clphs.edu.my)/g.test(email)? true : false,
    });
})

exports.syncStudentData = functions
    .firestore
    .document('students/{studentid}')
    .onWrite(async (change, context) => {
        // const { studentid } = context.params;
        // const { uid } = context.auth.token;
        //If document has been updated, sync details to user uid documents in linkedAccounts field
        if(change.after.exists) {
            const { linkedAccounts, ...studentDetails } = change.after.data();
            //Check if linked Account exists, else error
            if(!linkedAccounts) throw new Error('Account Not Found')
            //Create batch to update linkedAccounts
            const batch = db.batch();
            //Loop through linkedAccounts
            linkedAccounts.forEach( (uid) => {
                //Update linked Account document
                batch.set(db.doc(`users/${uid}`),{
                    ...studentDetails
                },{merge: true})
            })

            await batch.commit();

            //if englishName, chineseName or studentid updates, update user_claims
            const { englishName: engN_after, chineseName: chiN_after, studentid: stuID_after } = studentDetails;
            const { englishName: engN_before, chineseName: chiN_before, studentid: stuID_before } = change.before.data();
            if(engN_after !== engN_before || chiN_after !== chiN_before || stuID_after !== stuID_before) {
                await Promise.all(linkedAccounts.map( (uid) => {
                  return updateUserClaims(uid, {
                    englishName: engN_after,
                    chineseName: chiN_after,
                    studentid: stuID_after
                  })
                }
              )) 
            }
        }
    });