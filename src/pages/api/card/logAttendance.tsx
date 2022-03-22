import { Timestamp } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { adminRtdb, adminDb } from "../../../config/firebase-admin"
import { withAuth } from "../../../config/middlewares"
import ApiRequestWithAuth from "../../../types/ApiRequestWithAuth";

const LogAttendance = async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { cardId } = req.body;
    const { uid } = req.token;
    const cardSnapshot = await adminRtdb.ref(`cards/${cardId}`).once('value');
    const { displayName, studentid, active, createdBy, createdOn, modifiedOn } = cardSnapshot.val();
    if(!active) throw new Error("Card is not active");
    //get current event
    const eventSnap = await adminDb.collection("events").where("startTime", "<=", Timestamp.now()).get()
    if(eventSnap.empty) throw new Error("No event found");
    const event = eventSnap.docs[0].data();
    //type Conditions = {
    //    late: number,
    //    absent: number,
    //}
    const { eventId, startTime, endTime, conditions } = event; 
    //register attendance for this event
    const minutesDiff = (Timestamp.now().seconds - startTime.seconds) / 60;
    adminDb.collection("attendance").doc(eventId).update({
        [studentid]: {
            attended: Timestamp.now(),
            status: (minutesDiff > conditions.absent)?"absent":(minutesDiff > conditions.late)?"late":"present"
        }
    })
    res.json({
        success: true,
        message: "Attendance logged successfully"
    })
}

export default withAuth(LogAttendance)