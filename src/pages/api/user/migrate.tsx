import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import { NextApiRequest, NextApiResponse } from "next";
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const migrate = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        const { userDetails:{
            createdOn,
            modifiedOn,
            updatedOn,
            status,
            permission,
            ...details
        } } = JSON.parse(req.body)
        const { email, uid } = req.token
    
        //Check if email is student email, else don't give a fck
        if(!/(s[0-9]{5}@clphs.edu.my)/g.test(email)) throw new Error("You are not a student");
        
        //Fetch user existing data, if snapshot is empty, throw error
        const studentid = email.substr(1,5);
        
        //update user photoURL
        await adminAuth.updateUser(uid, {
            photoURL: `https://sms.clphs.edu.my/sms/images/data/student/student-${studentid}.jpg`
        })

        //Set Student Data
        await adminDb.doc(`students/${studentid}`).set({
            ...details,
            migrated: true,
            linkedAccounts: [uid],
            photoURL: `https://sms.clphs.edu.my/sms/images/data/student/student-${studentid}.jpg`,
            createdOn: admin.firestore.FieldValue.serverTimestamp(),
            modifiedOn: admin.firestore.FieldValue.serverTimestamp()
        })
        res.status(200).send(JSON.stringify({status:200, message: "Migration Successful"}))
    } catch(e) {
        console.error(e)
        throw new Error("An Error Occurred")
    }
}

export default withAuth(migrate)