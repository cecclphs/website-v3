import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiRequest, NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const createUser = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { email, uid } = req.token;

        //Check if email is student email, else don't give a fck
        if(!/(s[0-9]{5}@clphs.edu.my)/g.test(email)) {
            res.status(403).json({ error: "You are not a student" });
            return;
        }

        const { userDetails:{
            createdOn,
            modifiedOn,
            updatedOn,
            status,
            permission,
            ...details
        } } = req.body;
        
        //Fetch user existing data, if snapshot is empty, throw error
        const studentid = email.substring(1,6);
        
        //update user photoURL
        await adminAuth.updateUser(uid, {
            photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`
        })

        //Set Student Data
        await adminDb.doc(`students/${studentid}`).set({
            ...details,
            migrated: true,
            linkedAccounts: admin.firestore.FieldValue.arrayUnion(uid),
            photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`,
            status: "enrolled",
            createdOn: admin.firestore.FieldValue.serverTimestamp(),
            modifiedOn: admin.firestore.FieldValue.serverTimestamp()
        })
        await adminDb.doc(`user_claims/${uid}`).set({
            englishName: details.englishName,
            chineseName: details.chineseName,
            studentid: studentid,
            isStudent: true,
        }, { merge: true })
        res.status(200).send(JSON.stringify({status:200, message: "Create Account Successful"}))
    } catch(e) {
        console.error('Create user error:', e);
        return res.status(500).json({
            error: "An error occurred while creating user",
            message: e instanceof Error ? e.message : 'Unknown error'
        });
    }
}

export default withAuth(createUser)