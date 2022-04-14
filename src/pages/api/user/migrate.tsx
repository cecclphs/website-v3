import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiRequest, NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import {Timestamp} from 'firebase/firestore';

const migrate = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { userDetails:{
            createdOn,
            modifiedOn,
            updatedOn,
            status,
            permission,
            ...details
        } } = req.body
        const { email, uid } = req.token
        console.log(req.body)
        //TODO: API MIGHT BE ABUSED
        //Check if student is already migrated,
        const studentSnap = await adminDb.collection("students").doc(details.studentid).get();
        if(studentSnap.data()?.migrated)
            return res.status(409).json({status: 409, success: false, message: "Student already migrated"});
        //Fetch user existing data, if snapshot is empty, throw error
        const studentid = details.studentid
        
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
        }, { merge: true })
        await adminDb.doc(`user_claims/${uid}`).set({
            englishName: details.englishName,
            chineseName: details.chineseName,
            studentid: studentid,
            isStudent: true,
        }, { merge: true })
        res.status(200).send(JSON.stringify({status:200, success: true, message: "Migration Successful"}))
    } catch(e) {
        console.error(e)
        throw new Error("An Error Occurred")
    }
}

export default withAuth(migrate)