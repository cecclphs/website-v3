import { sub } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { admin, adminDb, adminRtdb } from "../../../config/firebase-admin";
import {withTerminalAPI} from '../../../config/middlewares';
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import {AttendanceRecord} from '../../../types/Attendance';

type CardRecord = {
    active: boolean,
    createdOn: number,
    displayName: string,
    studentid: string,
}

type CardScannedRecord = {
    scannedOn: admin.firestore.Timestamp,
    studentid: string,
    type: 'in' | 'out',
}

export default withTerminalAPI(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        if(!req.token.attendance)  throw new Error("You are not a student");
        const { cardId } = req.body as { cardId: number };
        //get the cardId Record
        console.log(req.body)
        const cardRecordSnap = await adminRtdb.ref(`/cards/${cardId}`).once('value');
        if(!cardRecordSnap.exists()) throw new Error("Card not found");
        const cardRecord = cardRecordSnap.val() as CardRecord;
        if(!cardRecord.active) throw new Error("Card is not active");

        //get the studentid
        const studentid = cardRecord.studentid;

        //get the attendance record that is has started or starts in 30 minutes
        const attdDoc = await adminDb.collection('attendanceRecords').where('startTimestamp', '>=', admin.firestore.Timestamp.fromDate(sub(new Date(), { minutes: 30 }))).limit(1).get();
        if(attdDoc.empty) throw new Error("No active attendance");
        const attdRecord = {
            id: attdDoc.docs[0].id,
            ref: attdDoc.docs[0].ref,
            ...attdDoc.docs[0].data()
        } as unknown as AttendanceRecord;

        //Check if is newly scanned and is late or not
        const newlyScanned = attdRecord.students[studentid] === undefined;
        const isLate = admin.firestore.Timestamp.now().toMillis() - attdRecord.startTimestamp.toMillis() > 0;

        if(newlyScanned) {
            await adminDb.doc(`attendanceRecords/${attdRecord.id}`).update({
                [`students.${studentid}`]: isLate?"迟":'1',
            }) 
            res.status(200).json({status: 200, data: {
                studentid,
                direction: 'in',
                isLate,
                newRecord: true,
                recordName: attdRecord.recordName,
                startTimestamp: attdRecord.startTimestamp.toMillis(),
                endTimestamp: attdRecord.endTimestamp.toMillis(),
            }})
        }
        else {
            //check if the student has already scanned in
            const direction = await adminDb
                .collection('attendanceRecords').doc(attdRecord.id)
                .collection('scanned')
                .where('studentid', '==', studentid)
                .orderBy('scannedOn', 'desc')
                .limit(1)
                .get()
                .then(async (snap) => {
                    //TODO: Add task to set to 0 if he's out for more than 5 minutes
                    if(snap.empty) throw new Error("Student has been scanned in yet newlyScanned gone wrong");
                    const scannedRecord = snap.docs[0].data() as CardScannedRecord;
                    await adminDb.collection('attendanceRecords').doc(attdRecord.id).collection('scanned').add({
                        scannedOn: admin.firestore.Timestamp.now(),
                        studentid,
                        type: scannedRecord.type === 'in' ? 'out' : 'in'
                    } as CardScannedRecord)
                    return scannedRecord.type === 'in' ? 'out' : 'in'
                })
            res.status(200).json({status: 200, data: {
                studentid,
                direction,
                newRecord: false,
                recordName: attdRecord.recordName,
                startTimestamp: attdRecord.startTimestamp.toMillis(),
                endTimestamp: attdRecord.endTimestamp.toMillis(),
            }})
        }
    }
    catch(e) {
        console.error(e)
        throw new Error("An Error Occurred")
    }
})
