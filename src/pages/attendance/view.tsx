import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { addDoc, collection, DocumentReference, query, Timestamp, updateDoc, where, deleteDoc, doc } from "firebase/firestore";
import { db, docConverter } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import React, { forwardRef, useMemo, useRef } from "react";
import StudentDetails from "../../types/StudentDetails";
import { ShortStudentInfo } from "../../types/User";
import { DataGrid, GridColDef, GridRenderEditCellParams, useGridApiContext, GridRenderCellParams, GridColumnMenuProps, GridColumnMenuContainer, SortGridMenuItems, GridFilterMenuItem, HideGridColMenuItem, GridColumnsMenuItem } from '@mui/x-data-grid';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import useAPIFetch from "../../hooks/useAPIFetch";
import { useAuth } from "../../hooks/useAuth";
import { update } from "firebase/database";
import { AttendanceRecord } from "../../types/Attendance";
import { useDialog } from "../../hooks/useDialog";
import FormTextField from "../../components/form-components/FormTextField";
import FormDatePicker from "../../components/form-components/FormDatePicker";
import FormSelect from "../../components/form-components/FormSelect";
import { useForm } from "react-hook-form";
import FormDateTimePicker from "../../components/form-components/FormDateTimePicker";
import { useRouter } from "next/router";


type RecordForm = {
    recordName: string,
    recordType: 'activity' | 'special' | 'other',
    startTimestamp: Date,
    endTimestamp: Date,
    notes?: string,
}

const AddAttendanceRecord = ({ onClose }: { onClose: () => void }) => {
    const { userToken } = useAuth();
    const { register, handleSubmit, setValue, control, watch, formState: { isValid, errors }, reset } = useForm<RecordForm>({
        defaultValues: {
            startTimestamp: new Date(),
            endTimestamp: new Date(),
        }
    });

    const handleCreate = async (data: RecordForm) => {
        await addDoc(collection(db, 'attendanceRecords'), {
            recordName: data.recordName,
            recordType: data.recordType,
            startTimestamp: Timestamp.fromDate(data.startTimestamp),
            endTimestamp: Timestamp.fromDate(data.endTimestamp),
            ...data.notes?{ notes: data.notes }:{},
            metadata: {
                createdOn: Timestamp.now(),
                createdBy: {
                    studentid: userToken.studentid,
                    englishName: userToken.englishName,
                },
            },
            students:{}
        } as Omit<AttendanceRecord, 'id' | 'ref'>);
        reset();
        onClose();
    }

    return <>
        <DialogTitle>
            Add Attendance Record
        </DialogTitle>
        <DialogContent>
            <div className="space-y-2 py-2">
                <div className="flex flex-row space-x-2">
                    <FormTextField
                        fullwidth
                        control={control}
                        rules={{required: true}}
                        name="recordName"
                        label="Record Name"
                        />
                    <FormSelect
                        fullwidth
                        sx={{minWidth: '100px'}}
                        control={control}
                        rules={{required: true}}
                        name="recordType"
                        label="Record Type"
                        options={[
                            { value: 'activity', label: 'Activity' },
                            { value: 'special', label: 'Special' },
                            { value: 'other', label: 'Other' },
                        ]}
                        />
                </div>
                <div className="flex flex-row space-x-2">
                    <FormDateTimePicker
                        control={control}
                        name="startTimestamp"
                        label="Start Time"
                        rules={{required: true}}
                        />
                    <FormDateTimePicker
                        control={control}
                        name="endTimestamp"
                        label="End Time"
                        rules={{required: true}}
                        />
                </div>
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleSubmit(handleCreate)}>Create</Button>
        </DialogActions>
    </>
}

const GridColumnMenu = forwardRef<
  HTMLUListElement,
  GridColumnMenuProps
>(function GridColumnMenu(props: GridColumnMenuProps, ref) {
    const [openDialog, closeDialog] = useDialog()
    const { hideMenu, currentColumn } = props;
    const router = useRouter();
    const isRecord = !['studentid','chineseName','englishName','class','gender','enrollmentDate'].includes(currentColumn.field)
    
    const confirmDelete = () => {
        openDialog({
            children: <>
                <DialogContent>Are you sure you want to delete this record?</DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={() => {
                        deleteDoc(doc(collection(db, 'attendanceRecords'), currentColumn.description))
                            .then(() => closeDialog())
                    }}>Delete</Button>
                </DialogActions>
            </>
        })
    }

    return (
        <GridColumnMenuContainer ref={ref} {...props}>
            <SortGridMenuItems onClick={hideMenu} column={currentColumn!} />
            <GridFilterMenuItem onClick={hideMenu} column={currentColumn!} />
            <HideGridColMenuItem onClick={hideMenu} column={currentColumn!} />
            <GridColumnsMenuItem onClick={hideMenu} column={currentColumn!} />
            {isRecord&&<>
            <Divider/>
            <MenuItem onClick={() => router.push(`/attendance/${currentColumn.description}/callout`)}>Callout</MenuItem>
            <MenuItem onClick={() => router.push(`/attendance/${currentColumn.description}/liveview`)}>Live View</MenuItem>
            <MenuItem onClick={confirmDelete} color="error">Delete</MenuItem>
            {/* <MenuItem>Edit</MenuItem> */}
            </>}
        </GridColumnMenuContainer>
    );
});
  

const ViewAttendance = () => {
    const { user } = useAuth()
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    // const { error, data: students = []} = useAPIFetch<StudentDetails[]>('students',{}, user)
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter)));
    const [openDialog, closeDialog] = useDialog();
    
    const handleAddDialog = () => {
        openDialog({
            children: <AddAttendanceRecord onClose={closeDialog}/>,
        })
    }

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
            width: 110
        }
      ];
      

    const [columns, data] = useMemo(() => {
        if(students.length == 0) return [[] ,[]];
        const combined = {} as {[studentid: number]: StudentDetails};
        students.forEach(student => {
            combined[student.studentid] = student;
        });
        records.forEach(record => {
            const { id, ref, recordType, recordName, updatedOn, students } = record;
            baseColumns.push({
                field: recordName,
                headerName: recordName,
                description: id,
                editable: true,
                type: 'singleSelect',
                valueOptions: [
                    {value: '1',label: '1'},
                    {value: '0', label: '0'},
                    {value: '迟', label: '迟'},
                    {value: '特', label: '特'},
                    {value: '事', label: '事'},
                    {value: '公', label: '公'},
                ]
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
            <Button onClick={handleAddDialog}>New Record</Button>
            <DataGrid
                autoHeight
                loading={studentsLoad || recordsLoad}
                rows={data}
                columns={columns}
                disableSelectionOnClick
                getRowId={(row) => row.studentid}
                experimentalFeatures={{ newEditingApi: true }} 
                processRowUpdate={processRowUpdate}
                density="compact"
                components={{
                    ColumnMenu: GridColumnMenu,
                }}
        
            />
        </Page>
    </MemberLayout>
}

export default ViewAttendance;
