import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs/promises'
import { admin, adminAuth, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import StudentDetails from "../../../types/StudentDetails";
import { UploadPublicFile } from "../../../utils/api/storage";
import { ToFixedSizePNG } from "../../../utils/api/image";
import vision from '@google-cloud/vision';

const updatePicture = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { uid, studentid, isAdmin } = req.token;

    //check if user is logged in, else send 403
    if(!uid) {
        res.status(403).json({ error: "You are not logged in" });
        return;
    }

    //get new picture and optional target student
    const { image, targetStudentId } = req.body;

    // Determine which student ID to update
    const updateStudentId = targetStudentId || studentid;

    if (!updateStudentId) {
        res.status(400).json({ error: "Student ID not found" });
        return;
    }

    // If updating another student's picture, must be admin
    if (targetStudentId && targetStudentId !== studentid && !isAdmin) {
        res.status(403).json({ error: "Admin privileges required to update other student profiles" });
        return;
    }

    const base64EncodedImageString = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');

    const client = new vision.ImageAnnotatorClient({
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
        },
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    const [result] = await client.faceDetection(imageBuffer);
    const faces = result.faceAnnotations;
    console.log('Faces:', faces);
    if(faces.length == 0) {
        res.status(400).json({ error: "This picture is unusable, please select one with your visible face." });
        return;
    }
    console.log('generating profile picture...');
    console.log('uploading profile picture...');
    const imageUrl = await UploadPublicFile(await ToFixedSizePNG(imageBuffer, 512, 512), `profiles/${updateStudentId}.png`);
    //get student document
    const studentSnap = await adminDb.collection("students").doc(updateStudentId).get();
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