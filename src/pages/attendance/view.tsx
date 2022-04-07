import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import MUIDataTable from "mui-datatables";
import { collection, DocumentReference, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { db, docConverter } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useMemo, useRef } from "react";
import StudentDetails from "../../types/StudentDetails";
import { ShortStudentInfo } from "../../types/User";
import { DataGrid, GridColDef, GridRenderEditCellParams, useGridApiContext, GridRenderCellParams } from '@mui/x-data-grid';
import { MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import useAPIFetch from "../../hooks/useAPIFetch";
import { useAuth } from "../../hooks/useAuth";
import { update } from "firebase/database";
import { AttendanceRecord } from "../../types/Attendance";

const SelectCell = ({options, ...props}:GridRenderEditCellParams) => {
    const { id, value, field } = props;
    const apiRef = useGridApiContext();

    const handleChange = async (event) => {
        await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
        apiRef.current.stopCellEditMode({ id, field });
    };

    return <Select
        value={value}
        onChange={handleChange}
        size="small"
        sx={{ height: 1, width: '100%' }}
        autoFocus
        defaultOpen
    >
        {options.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
    </Select>
        
}


const ViewAttendance = () => {
    const { user } = useAuth()
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    // const { error, data: students = []} = useAPIFetch<StudentDetails[]>('students',{}, user)
    console.log(students)
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter)));
    const baseColumns: GridColDef[] = [
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
        }
      ];
      

    const [columns, data] = useMemo(() => {
        if(students.length == 0) return [[] ,[]];
        const combined = {} as {[studentid: number]: StudentDetails};
        students.forEach(student => {
            combined[student.studentid] = student;
        });
        records.forEach(record => {
            const { id, ref, recordType, recordName, createdBy, createdOn, updatedOn, students } = record;
            baseColumns.push({
                field: recordName,
                headerName: recordName,
                editable: true,
                renderEditCell: (params: GridRenderEditCellParams) => 
                    <SelectCell options={[
                        {value: '1',label: '1'},
                        {value: '0', label: '0'},
                        {value: '迟', label: '迟'},
                        {value: '特', label: '特'},
                        {value: '事', label: '事'},
                        {value: '公', label: '公'},
                    ]} {...params}/>
            })
            Object.keys(students).forEach(studentid => {
                if(!combined[studentid]) return;
                combined[studentid][recordName] = students[studentid];
                console.log(students[studentid])
            })
        })

        return [baseColumns, Object.values(combined)];
        
    }, [records, students]);

    console.log(data)
    
    const processRowUpdate = (newRow: StudentDetails) => {
        //get data of same row
        const oldRow = data.find(row => row.studentid == newRow.studentid);
        //get the updated key and value
        const key = Object.keys(newRow).find(key => newRow[key] != oldRow[key]);
        const value = newRow[key];
        //update the data
        //get the record from key
        const record = records.find(record => record.recordName == key);
        updateDoc(record.ref, {
            [`students.${newRow.studentid}`]: value
        })
        return newRow
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
