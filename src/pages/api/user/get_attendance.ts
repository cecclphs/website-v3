import { adminDb } from "../../../config/firebase-admin";

export default withAuth(async (req: ApiRequestWithAuth, res: NextApiResponse) => {
    const { studentid } = req.token;
    //get student records
    const records: {
        [recordName: string]: string
    } = await adminDb
        .collection('attendanceRecords')
        .where(`students.${studentid}`, "!=", null)
        .get()
        .then(snap => {
            const final = {}
            snap.docs.forEach(doc => {
                const record = doc.data()
                final[record.recordName] = record.students[studentid]
            })
            return final
        })
    res.status(200).json({status: 200, data: records})
})