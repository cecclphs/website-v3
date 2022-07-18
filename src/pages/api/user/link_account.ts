import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiRequest, NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { FieldValue } from "firebase-admin/firestore";

const linkAccount = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { email, studentid } = req.body;

        //get student data
        const studentData = await adminDb.doc(`students/${studentid}`).get();
        if(!studentData.exists) throw new Error("Student not found");
        const student = studentData.data() as any;

        let user: UserRecord;
        try {
            user = await adminAuth.getUserByEmail(email)
        } catch(e) {
            user = await adminAuth.createUser({
                email: email,
                displayName: student.englishName,
                photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`
            })
        }
        const newAccUID = user.uid;
        if(student.linkedAccounts.includes(newAccUID)) {
            throw new Error("Account already linked");
        }
        //query and see if acc is linked to other students
        const linkedAccounts = await adminDb.collection("students")
            .where("linkedAccounts", "array-contains", newAccUID)
            .get();
        if(linkedAccounts.size > 0) {
            throw new Error("Account already linked to other students");
        }
        //add student to linkedAccounts
        await adminDb.doc(`students/${studentid}`).update({
            linkedAccounts: FieldValue.arrayUnion(newAccUID)
        })
        //set acc with student data
        await adminDb.doc(`user_claims/${newAccUID}`).set({
            englishName: student.englishName,
            chineseName: student.chineseName,
            studentid: studentid,
            isStudent: true,
        }, { merge: true })
        //set acc users to data
        await adminDb.doc(`users/${newAccUID}`).set({
            ...student,
            migrated: true,
            linkedAccounts: FieldValue.arrayUnion(newAccUID),
            photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`,
            createdOn: FieldValue.serverTimestamp(),
            modifiedOn: FieldValue.serverTimestamp()
        }, { merge: true })
        res.status(200).send(JSON.stringify({status:200, message: "Create Account Successful"}))
    } catch(e) {
        console.error(e)
        res.status(500).send(JSON.stringify({status:500, message: e.message}))
    }
}

export default withAuth(linkAccount)