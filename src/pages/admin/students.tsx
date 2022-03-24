import { collection, DocumentReference } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";
import StudentDetails from "../../types/StudentDetails";

const StudentData = ({ student }: {student: StudentDetails}) => {
    return <tr className="text-center">
        <td>{student.studentid}</td>
        <td>{student.chineseName}</td>
        <td>{student.englishName}</td>
        <td>{student.phone}</td>
        <td>{student.emergencyphone}</td>
        <td>{student.linkedAccounts.length}</td>
    </tr>
}

const Students = () => {
    const [students = [], loading, error] = useCollectionData<StudentDetails & {ref: DocumentReference}>(collection(db, 'students').withConverter(docConverter));
    return <MemberLayout>
        <Page title="Students">
            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>名字</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Emergency Contact</th>
                        <th>Accounts</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => <StudentData key={student.id} student={student}/>)}
                </tbody>
            </table>
        </Page>
    </MemberLayout>
}

export default Students;