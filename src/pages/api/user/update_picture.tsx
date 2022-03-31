import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs/promises'
import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import StudentDetails from "../../../types/StudentDetails";
import { UploadPublicFile } from "../../../utils/api/storage";
import { ToFixedSizePNG } from "../../../utils/api/image";

const updatePicture = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { uid, email, studentid } = req.token;
    //check if user is logged in, else send 403
    if(!uid) res.status(403).json({ error: "You are not logged in" });
    //get new picture
    const { image } = req.body;
    const base64EncodedImageString = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
    console.log('generating profile picture...');
    console.log('uploading profile picture...');
    const imageUrl = await UploadPublicFile(await ToFixedSizePNG(imageBuffer, 512, 512), `profiles/${studentid}.png`);
    //get student document
    const studentSnap = await adminDb.collection("students").doc(studentid).get();
    const { linkedAccounts } = studentSnap.data() as StudentDetails
    //update user photoURL for each user
    for(const linkedAccount of linkedAccounts) {
        await adminAuth.updateUser(linkedAccount, { photoURL: imageUrl });
    }
    studentSnap.ref.update({ photoURL: imageUrl });
    //delete tmp file
    console.log('succesfully updated profile picture');
    res.json({ message: "success" });

    // UploadPublicFile()
}

export default withAuth(updatePicture)