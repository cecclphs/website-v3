import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import MUIDataTable from "mui-datatables";
import { collection, DocumentReference, query, Timestamp, where } from "firebase/firestore";
import { db, docConverter } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useMemo } from "react";
import StudentDetails from "../../types/StudentDetails";
import { ShortStudentInfo } from "../../types/User";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TextField } from "@mui/material";
import useAPIFetch from "../../hooks/useAPIFetch";
import { useAuth } from "../../hooks/useAuth";

interface AttendanceRecord {
    id: string,
    ref: DocumentReference,
    recordName: string,
    recordType: string,
    createdBy: ShortStudentInfo,
    createdOn: Timestamp,
    updatedOn: Timestamp
    students: {[studentid: number]: string}
}



const ViewAttendance = () => {
    const { user } = useAuth()
    // const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const { error, data: students = []} = useAPIFetch<StudentDetails[]>('/students',{}, user)
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter)));
    const baseColumns: GridColDef[] = [
        { field: 'studentid', headerName: 'Student ID', width: 90 },
        {
            field: 'chineseName',
            headerName: 'Chinese Name',
            width: 150,
        },
        {
            field: 'englishName',
            headerName: 'English Name',
            width: 150,
        },
        {
            field: 'class',
            headerName: 'Class',
            width: 110,
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 110
        },
        {
            field: 'enrollmentDate',
            headerName: 'Enrolled',
        }
      ];
      

    const [columns, data] = useMemo(() => {
        if(students.length == 0) return [[] ,[]];
        const combined = {} as {[studentid: number]: StudentDetails};
        students.forEach(student => {
            combined[student.studentid] = student;
        });
        console.log(combined)
        records.forEach(record => {
            const { id, ref, recordType, recordName, createdBy, createdOn, updatedOn, students } = record;
            baseColumns.push({
                field: recordName,
                headerName: recordName,
                editable: true
            })
            Object.keys(students).forEach(studentid => {
                if(!combined[studentid]) return;
                combined[studentid][recordType] = students[studentid];
            })
        })

        return [baseColumns, Object.values(combined)];
        
    }, [records, students]);
    
    const processRowUpdate = (newRow) => {
        
    }

    return <MemberLayout>
        <Page title="View Attendance">
            <DataGrid
                autoHeight
                rows={data}
                columns={columns}
                checkboxSelection
                disableSelectionOnClick
                getRowId={(row) => row.studentid}
                experimentalFeatures={{ newEditingApi: true }} 
                processRowUpdate={processRowUpdate}
            />
        </Page>
    </MemberLayout>
}

export default ViewAttendance;
