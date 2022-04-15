import { Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { collection, DocumentReference, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useCollectionData } from "react-firebase-hooks/firestore";
import AddStudentProfile from "../../components/AddStudentProfile";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";
import { useDialog } from "../../hooks/useDialog";
import StudentDetails from "../../types/StudentDetails";

const StudentData = ({ student }: {student: StudentDetails}) => {
    const router = useRouter()
    return <tr className="text-center transition hover:bg-gray-100" onClick={() => router.push('/students/'+ student.studentid)}>
        <td className="p-1">{student.studentid}</td>
        <td className="p-1">{student.chineseName}</td>
        <td className="p-1 text-left">{student.englishName}</td>
        <td className="p-1 text-left">{student.phone}</td>
        <td className="p-1 text-left">{student.emergencyphone}</td>
        <td className="p-1">{student.linkedAccounts?.length || 0}</td>
    </tr>
}

const Students = () => {
    const [students = [], loading, error] = useCollectionData<StudentDetails>(query(collection(db, 'students').withConverter(docConverter), where('status', '==', 'enrolled')));
    const [openDialog, closeDialog] = useDialog();

    const handleCreateStudent = () => {
        openDialog({
            children: <AddStudentProfile onClose={closeDialog}/>
        })
    }

    return <MemberLayout>
        <Page title="Students">
            <Button onClick={handleCreateStudent}>Add Student</Button>
            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>名字</th>
                        <th className="text-left">Name</th>
                        <th className="text-left">Phone</th>
                        <th className="text-left">Emergency Contact</th>
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