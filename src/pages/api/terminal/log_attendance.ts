import { NextApiRequest, NextApiResponse } from "next";
import { admin, adminDb, adminRtdb } from "../../../config/firebase-admin";
import {withTerminalAPI} from '../../../config/middlewares';
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import {AttendanceRecord} from '../../../types/Attendance';

export default withTerminalAPI(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        if(!req.token.attendance)  throw new Error("You are not a student");
        const { cardId } = req.body;
        //query attendanceRecords the current active attendance
        const attdDoc = await adminDb.collection('attendanceRecords').where('startTimestamp', '>', admin.firestore.Timestamp.now()).where('endTimestamp', '<', admin.firestore.Timestamp.now()).get();
        if(attdDoc.empty) throw new Error("No active attendance");
        const attdRecord = attdDoc.docs[0].data() as AttendanceRecord;
        
        await adminDb.collection('attendanceRecords').doc(attdRecord.id).collection('scanned').add({

        })

    }
    catch(e) {
        console.error(e)
        throw new Error("An Error Occurred")
    }
})

