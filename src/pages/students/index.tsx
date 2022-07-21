import { Button } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbar } from "@mui/x-data-grid-pro";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useCollectionData } from "react-firebase-hooks/firestore";
import AddStudentProfile from "../../components/AddStudentProfile";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";
import { useDialog } from "../../hooks/useDialog";
import StudentDetails from "../../types/StudentDetails";


const Students = () => {
    const [students = [], loading, error] = useCollectionData<StudentDetails>(query(collection(db, 'students').withConverter(docConverter), where('status', '==', 'enrolled')));
    const [openDialog, closeDialog] = useDialog();
    const router = useRouter();
    const handleCreateStudent = () => {
        openDialog({
            children: <AddStudentProfile onClose={closeDialog}/>
        })
    }

    const columns: GridColDef[] = [
        { field: 'studentid', headerName: 'ID', width: 70 },
        {
            field: 'chineseName',
            headerName: '名字',
            width: 80,
        },
        {
            field: 'englishName',
            headerName: 'Name',
            width: 150,
        },
        {
            field: 'class',
            headerName: 'Class',
            width: 80,
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 80
        },
        {
            field: 'enrollmentDate',
            headerName: 'Enrolled',
            width: 110
        },
        { field: 'phone', headerName: 'Phone' },
        { field: 'emergencyphone', headerName: 'Emergency Phone' },
        { field: 'identification', headerName: 'Identification' },
        { field: 'email', headerName: 'Email' },
        { field: 'address', headerName: 'Address' },
        { field: 'birthday', headerName: 'Birthday' },
        { field: 'motherName', headerName: 'Mother Name' },
        { field: 'motherPhone', headerName: 'Mother Phone' },
        { field: 'fatherName', headerName: 'Father Name' },
        { field: 'fatherPhone', headerName: 'Father Phone' },
        { field: 'emergencyrelation', headerName: 'Emergency Relation' },
        { field: 'specials', headerName: 'Specials' },
        { field: 'committeeRole', headerName: 'Committee Role' },
        { field: 'linkedAccounts', headerName: 'Accounts', valueGetter: (params) => params.row.linkedAccounts.length },
        { field: 'photoURL', headerName: 'Photo', valueGetter: (params) => params.row.photoURL ? <img src={params.row.photoURL} className="w-8 h-8 rounded-full" /> : null },
        { field: 'status', headerName: 'Status' },
        { field: 'actions', headerName: "", renderCell: (params) => (
            <Button
                size="small"
                variant="contained"
                onClick={() => {
                    router.push(`/students/${params.row.studentid}`)
                }}
            >
                Open
            </Button>
        )}
      ];
      

    return <MemberLayout>
        <Page title="Students">
            <Button onClick={handleCreateStudent}>Add Student</Button>
            <table className="w-full table-auto">
            <DataGridPro
                loading={loading}
                autoHeight
                rows={students}
                columns={columns}
                checkboxSelection
                disableSelectionOnClick
                getRowId={(row) => row.studentid}
                density="compact"
                components={{
                    Toolbar: GridToolbar
                }}
                initialState={{
                    columns: {
                      columnVisibilityModel: {
                        englishName: true,
                        chineseName: true,
                        gender: true,
                        studentid: true,
                        identification: false,
                        phone: true,
                        facebookURL: false,
                        email: false,
                        address: false,
                        birthday: false,
                        class: true,
                        motherName: false,
                        motherPhone: false,
                        fatherName: false,
                        fatherPhone: false,
                        emergencyphone: true,
                        emergencyrelation: false,
                        specials: false,
                        committeeRole: false,
                        enrollmentDate: true,
                        linkedAccounts: true,
                        photoURL: false,
                        status: false,
                      },
                    },
                  }}
                
                />

            </table>
        </Page>
    </MemberLayout>
}

export default Students;