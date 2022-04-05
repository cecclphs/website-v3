import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../config/firebase-admin';
import {withAuth} from '../../config/middlewares';
import StudentDetails from '../../types/StudentDetails';

const cacheStudents = async (req: NextApiRequest, res: NextApiResponse) => {
    const studentsSnap = await adminDb.collection("students").where('status', '==', 'enrolled').get();
    const students = studentsSnap.docs.map(doc => {
        const stud = doc.data() as StudentDetails;
        return {
            studentid: stud.studentid,
            chineseName: stud.chineseName,
            englishName: stud.englishName,
            enrollmentDate: stud.enrollmentDate,
            gender: stud.gender,
            class: stud.class
        }
    });

    res.setHeader('Cache-Control', 's-maxage=86400');
    res.setHeader('Content-Type', 'application/json');
    res.json(students);
}
export default withAuth(cacheStudents)