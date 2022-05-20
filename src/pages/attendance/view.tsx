import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { addDoc, collection, query, Timestamp, updateDoc, where, deleteDoc, doc, orderBy, getDocs, getDoc } from "firebase/firestore";
import { db, docConverter, functions } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import StudentDetails from "../../types/StudentDetails";
import {
    DataGrid,
    GridColDef,
    GridColumnMenuProps,
    GridColumnMenuContainer,
    SortGridMenuItems,
    GridFilterMenuItem,
    HideGridColMenuItem,
    GridColumnsMenuItem,
    GridToolbar,
    GridSelectionModel,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridCsvExportMenuItem,
} from '@mui/x-data-grid';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Menu, MenuItem } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { AttendanceRecord } from "../../types/Attendance";
import { useDialog } from "../../hooks/useDialog";
import FormTextField from "../../components/form-components/FormTextField";
import FormSelect from "../../components/form-components/FormSelect";
import { useForm } from "react-hook-form";
import FormDateTimePicker from "../../components/form-components/FormDateTimePicker";
import { useRouter } from "next/router";
import { format } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";
import { Download, Link } from "@mui/icons-material";
import { width } from "@mui/system";
import { useSnackbar } from "notistack";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { httpsCallable } from "firebase/functions";


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
            ...(data.notes ? { notes: data.notes } : {}),
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
                        control={control}
                        rules={{required: true}}
                        name="recordName"
                        label="Record Name"
                        />
                    <FormSelect
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

const generateUnnoticedAttdFormLink = async (recordId: string) => {
    const students = (await getDocs<StudentDetails>(query(collection(db, 'students').withConverter(docConverter), where('status', '==', 'enrolled')))).docs.map(s => s.data());
    const record = (await getDoc<AttendanceRecord>(doc(collection(db, 'attendanceRecords').withConverter(docConverter), recordId))).data();
    const formlink = 'https://docs.google.com/forms/d/e/1FAIpQLSfvrxT_L-O-bHqPDPEqHaOhu4r-KaZExGZt4W2VJD_dDBUhJQ/viewform';
    const fields = {
        CLUB_FIELD: 988307389,
        SHEET_NUM: 361099120,
        ABSENT_AMT: 1252643529,
        ACTIVITY_DATE: 1084221149,
        STUD_1: 195803756,
        STUD_2: 264239247,
        STUD_3: 1146057617,
        STUD_4: 1655739229,
        STUD_5: 600378517,
        STUD_6: 962010138,
        STUD_7: 1857496131,
        STUD_8: 677090371,
        STUD_9: 1803847990,
        STUD_10: 33257580,
        RECORDER: 863357130
    }
    //filter out students who are in the record and is not == 0
    const absentees = students.filter(s => {
        const attendance = record.students[s.studentid]
        return !attendance || attendance == "0"
    });
    //split absentees into arrays of 10
    const groupArray = absentees.reduce<StudentDetails[][]>((acc, curr, i) => {
        if (i % 10 === 0) {
            acc.push([curr]);
        }
        else {
            acc[acc.length - 1].push(curr);
        }
        return acc;
    }, []);

    //create a form link for each group
    const formLinks = groupArray.map((group, index) => {
        let uri = `entry.${fields.CLUB_FIELD}=电子创意学会&entry.${fields.SHEET_NUM}=${index + 1}&entry.${fields.ABSENT_AMT}=${absentees.length}&entry.${fields.ACTIVITY_DATE}=${format(record.startTimestamp.toDate(), 'yyyy-MM-dd')}`;
        // formLink += ``;
        group.forEach((student, index) => {
            //学号 名字 班级
            uri += `&entry.${fields[`STUD_${index+1}`]}=${student.studentid} ${student.chineseName} ${student.class}`;
        });
        uri += `&entry.${fields.RECORDER}=秘书，郭哲谦`;
        
        return `${formlink}?${encodeURI(uri)}`;
    })

    return formLinks;
}

const FormLinksDialog = ({ onClose, recordId }: { onClose: () => void, recordId: string }) => {
    const [formLinks, setFormLinks] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const links = await generateUnnoticedAttdFormLink(recordId);
            setFormLinks(links);
            setLoading(false);
        })();
    }, [recordId]);

    return <>
        <DialogTitle>
            Form Links
        </DialogTitle>
        <DialogContent>
            <div className="space-y-2 py-2">
                {loading ? <div className="flex flex-col items-center justify-center">
                    <CircularProgress />
                </div> : <div className="flex flex-col space-y-2">
                    {formLinks.map((link, index) => <a className="text-blue-800 " href={link} target="_blank" rel="noopener noreferrer">
                        <Link className="w-5 h-5"/>
                        Form {index+1}
                    </a>)}
                </div>}
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
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

    const openLinks = () => {
        openDialog({
            children: <FormLinksDialog recordId={currentColumn.description} onClose={closeDialog}/>
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
            <MenuItem onClick={openLinks}>Generate Form</MenuItem>
            <MenuItem onClick={confirmDelete} color="error">Delete</MenuItem>
            {/* <MenuItem>Edit</MenuItem> */}
            </>}
        </GridColumnMenuContainer>
    );
});

const PrintPDFDialog = ({ onClose }: { onClose: () => void }) => {
    const { user } = useAuth();
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter), orderBy('startTimestamp','desc')));
    const [selected, setSelected] = useState<GridSelectionModel>([]);
    const { enqueueSnackbar } = useSnackbar();
    
    //use fetch to get the pdf and download it
    const downloadFile = async (url: string, filename: string) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${await user.getIdToken()}`
            }
        });
        const blob = await response.blob();
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const printstuff = async () => {
        const generatePdf = httpsCallable<{url: string, pdfOptions: any}, string>(functions, 'generatePdf');
        const uploadedUrl = await generatePdf({
            url: `https://clphscec.ga/attendance/print?${selected.map(id => `record=${id}`).join('&')}`,
            pdfOptions: {
                format: 'A4',
                printBackground: true,
                landscape: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            }
        })
        
        downloadFile(uploadedUrl.data, 'attendance.pdf')
        onClose();
    }

    const columns = [
        {
            field: 'recordName',
            title: 'Name',
            width: 150
        },
        {
            field: 'recordType',
            title: 'Type',
            width: 120
        }
    ]
    
    return <>
        <DataGrid
            autoHeight
            columns={columns}
            rows={records}
            loading={recordsLoad}
            checkboxSelection={true}
            getRowId={(row) => row.id}
            experimentalFeatures={{ newEditingApi: true }}
            density="compact"
            onSelectionModelChange={(selected) => {
                //dont allow exceeding 6 records
                if(selected.length > 6) {
                    enqueueSnackbar('You can only select up to 6 records', { variant: 'error' })
                } else {
                    setSelected(selected);
                }
            }}
            selectionModel={selected}
        />
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={printstuff}>Generate PDF</Button>
        </DialogActions>
    </>
}

function CustomToolbar() {
    const [openDialog, closeDialog] = useDialog();

    const handlePrintPDF = () => {
        //show user a dialog to select date range
        openDialog({
            children: <PrintPDFDialog onClose={closeDialog}/>
        })
    }
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
            <React.Fragment>
            <Button startIcon={<Download/>} {...bindTrigger(popupState)}>
                Export
            </Button>
            <Menu {...bindMenu(popupState)}>
                <GridCsvExportMenuItem/>
                <MenuItem onClick={() => {
                    handlePrintPDF();
                    popupState.close();
                }}>Print PDF</MenuItem>
            </Menu>
            </React.Fragment>
        )}
        </PopupState>
      </GridToolbarContainer>
    );
  }
  
//TODO: Breakup this into multiple files
const ViewAttendance = () => {
    const { user } = useAuth()
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    // const { error, data: students = []} = useAPIFetch<StudentDetails[]>('students',{}, user)
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter), orderBy('startTimestamp','asc')));
    const [openDialog, closeDialog] = useDialog()

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
                valueOptions: ['1','0','迟','特','事','公','病']
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
                getRowId={(row) => row.studentid}
                experimentalFeatures={{ newEditingApi: true }} 
                processRowUpdate={processRowUpdate}
                density="compact"
                components={{
                    ColumnMenu: GridColumnMenu,
                    Toolbar: CustomToolbar
                }}
        
            />
        </Page>
    </MemberLayout>
}

export default ViewAttendance;
