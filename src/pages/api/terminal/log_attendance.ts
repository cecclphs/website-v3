import { add, sub } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { admin, adminDb, adminRtdb } from "../../../config/firebase-admin";
import {withTerminalAPI} from '../../../config/middlewares';
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";
import {AttendanceRecord} from '../../../types/Attendance';

type CardRecord = {
    active: boolean,
    createdOn: number,
    englishName: string,
    chineseName: string,
    class: string,
    studentid: string,
}

type CardScannedRecord = {
    scannedOn: admin.firestore.Timestamp,
    studentid: string,
    type: 'in' | 'out',
}

export default withTerminalAPI(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    try {
        if(!req.token.attendance)  
            return res.status(403).json({status: 403, success: false, message: "You are not allowed to access this page"})
        const { cardId } = req.body as { cardId: number };
        console.log('cardId', cardId)
        //get the cardId Record
        const cardRecordSnap = await adminRtdb.ref(`/cards/${cardId}`).once('value');
        if(!cardRecordSnap.exists()) 
            return res.status(200).json({status: 200, success: false, message: "Card not found"})
        const cardRecord = cardRecordSnap.val() as CardRecord;
        if(!cardRecord.active) 
            return res.status(200).json({status: 200, success: false, message: "Card is not active"})
        
        //get the studentid
        const studentid = cardRecord.studentid;
        if(!studentid) throw new Error('Studentid is not defined')
        //get the attendance record that hasn't ended
        const attdDoc = await adminDb.collection('attendanceRecords').where('endTimestamp', '>', admin.firestore.Timestamp.now()).limit(1).get(); 
        if(attdDoc.empty)  
            return res.status(200).json({status: 200, success: false, message: "Attendance Record not found"})
        //check the startTimestamp and make sure it is starting in 30 minutes or has already started
        const startTimestampIn30Minutes = sub(attdDoc.docs[0].data().startTimestamp.toDate(), { minutes: 30 });

        if(startTimestampIn30Minutes > new Date())
            return res.status(200).json({status: 200, success: false, message: "Attendance Record not started yet"})
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
            await adminDb.collection('attendanceRecords').doc(attdRecord.id).collection('scanned').add({
                ...cardRecord,
                scannedOn: admin.firestore.Timestamp.now(),
                studentid,
                type: 'in'
            } as CardScannedRecord)
            res.status(200).json({status: 200, success: true, data: {
                studentid,
                englishName: cardRecord.englishName,
                chineseName: cardRecord.chineseName,
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
                        ...cardRecord,
                        scannedOn: admin.firestore.Timestamp.now(),
                        studentid,
                        type: scannedRecord.type === 'in' ? 'out' : 'in'
                    } as CardScannedRecord)
                    return scannedRecord.type === 'in' ? 'out' : 'in'
                })
            res.status(200).json({status: 200, success: true, data: {
                studentid,
                englishName: cardRecord.englishName,
                chineseName: cardRecord.chineseName,
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
        res.status(500).json({status: 500, success: false, message: "An Error Occurred"})
    }
})

