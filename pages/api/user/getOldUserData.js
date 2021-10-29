import { adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"

const handler = (req, res) => {
    const { uid, email } = req.token;
    //Check if email is student email, else don't give a fck
    if(!/(s[0-9]{5}@clphs.edu.my)/g.test(email)) throw new Error("You are not a student");
    
    //Fetch user existing data, if snapshot is empty, throw error
    const studentid = email.substr(1,5);
    const studentSnap = await adminDb.collection("users")
                                .where('studentid','==',studentid)
                                .get();
    if(studentSnap.empty) throw new Error("Student not found");

    //If user document id is the same as this uid, throw same user error
    if(studentSnap.docs[0].id === uid) throw new Error("You are the same user");
    
    //Get user and omit useless data
    const studentData = studentSnap.docs[0].data();
    const { _ft_updatedAt, _ft_updatedBy, photoURL, userGroup, permission, ...rest } = studentData; 
    res.json(rest)
}

export default withAuth(handler)