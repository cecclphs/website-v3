import { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import StudentDetails from "../../../types/StudentDetails";

const handler = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { uid, email } = req.token;
    //Check if email is student email, else don't give a fck
    if(!/(s[0-9]{5}@clphs.edu.my)/g.test(email)) 
        return res.status(403).json({status: 403, success: false, message: "You are not a student"});
    
    //Fetch user existing data, if snapshot is empty, throw error
    const studentid = email.substr(1,5);
    const studentSnap = await adminDb.collection("users")
                                .where('studentid','==',studentid)
                                .get();
    const studentDocs = studentSnap.docs.slice().filter(doc => doc.id !== uid);
    if(studentDocs.length == 0) 
        return res.status(404).json({status: 404, success: false, message: "Student Not Found"});

    const studentdoc = await adminDb.collection('students').doc(studentid).get();
    const data = studentdoc.data();
    if (!data) {
        return res.status(404).json({
            error: "Student not found",
            studentid
        });
    }

    const { linkedAccounts, modifiedOn, createdOn, ...student } = data as Omit<StudentDetails, "id"| "ref">;

    //Get user and omit useless data
    const studentData = studentDocs[0].data();
    console.log('found student for user: '+ studentDocs[0].id)
    const { _ft_updatedAt, _ft_updatedBy, _updatedOn, photoURL, userGroup, permission, ...rest } = studentData; 
    res.status(200).json({
        ...rest,
        ...student
    })
}

export default withAuth(handler)