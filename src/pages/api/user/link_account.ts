import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiRequest, NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { FieldValue } from "firebase-admin/firestore";

const linkAccount = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { email: rawEmail, studentid: rawStudentid } = req.body;

        // Trim inputs to prevent whitespace issues
        const email = rawEmail?.trim();
        const studentid = rawStudentid?.trim();

        if (!email || !studentid) {
            return res.status(400).json({
                error: "Email and student ID are required"
            });
        }

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

        // Update all documents with proper error handling
        await Promise.all([
            adminDb.doc(`students/${studentid}`).update({
                linkedAccounts: FieldValue.arrayUnion(newAccUID)
            }),
            adminDb.doc(`user_claims/${newAccUID}`).set({
                uid: newAccUID,
                englishName: student.englishName,
                chineseName: student.chineseName,
                studentid: studentid,
                isStudent: true,
                isAdmin: false,
                isCommittee: false,
                _lastCommitted: FieldValue.serverTimestamp()
            }, { merge: true }),
            adminDb.doc(`users/${newAccUID}`).set({
                uid: newAccUID,
                englishName: student.englishName,
                chineseName: student.chineseName,
                studentid: studentid,
                email: email,
                photoURL: student.photoURL || `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`,
                migrated: true,
                linkedAccounts: FieldValue.arrayUnion(newAccUID),
                createdOn: FieldValue.serverTimestamp(),
                modifiedOn: FieldValue.serverTimestamp()
            }, { merge: true })
        ]);

        res.status(200).json({
            success: true,
            message: 'Account linked successfully'
        });
    } catch(e) {
        console.error(e)
        res.status(500).send(JSON.stringify({status:500, message: e.message}))
    }
}

export default withAuth(linkAccount)