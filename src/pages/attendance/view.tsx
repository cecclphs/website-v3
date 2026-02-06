import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { addDoc, collection, query, Timestamp, updateDoc, where, deleteDoc, doc, orderBy, getDocs, getDoc, writeBatch } from "firebase/firestore";
import { db, docConverter, functions } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import StudentDetails from "../../types/StudentDetails";
import {
    DataGridPro,
    GridColDef,
    GridColumnMenuProps,
    GridColumnMenuContainer,
    SortGridMenuItems,
    GridFilterMenuItem,
    HideGridColMenuItem,
    GridColumnsMenuItem,
    GridSelectionModel,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridCsvExportMenuItem,
} from '@mui/x-data-grid-pro';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Menu, MenuItem, Tab, Tabs, Chip, Alert } from "@mui/material";
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
import { Download, Link, Archive, Unarchive } from "@mui/icons-material";
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
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, setValue, control, watch, formState: { isValid, errors, isSubmitting }, reset } = useForm<RecordForm>({
        defaultValues: {
            recordName: '',
            recordType: 'activity',
            startTimestamp: new Date(),
            endTimestamp: new Date(),
            notes: '',
        }
    });

    const handleCreate = async (data: RecordForm) => {
        if (!data.recordName?.trim()) {
            enqueueSnackbar('Record name is required', { variant: 'error' });
            return;
        }

        try {
            await addDoc(collection(db, 'attendanceRecords'), {
                recordName: data.recordName.trim(),
                recordType: data.recordType,
                startTimestamp: Timestamp.fromDate(data.startTimestamp),
                endTimestamp: Timestamp.fromDate(data.endTimestamp),
                ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
                archived: false,
                metadata: {
                    createdOn: Timestamp.now(),
                    createdBy: {
                        studentid: userToken.studentid,
                        englishName: userToken.englishName,
                    },
                },
                students: {}
            } as Omit<AttendanceRecord, 'id' | 'ref'>);
            enqueueSnackbar('Attendance record created', { variant: 'success' });
            reset();
            onClose();
        } catch (error) {
            console.error('Create record error:', error);
            enqueueSnackbar('Failed to create record', { variant: 'error' });
        }
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
                        rules={{ required: 'Record name is required' }}
                        name="recordName"
                        label="Record Name"
                        fullWidth
                        error={!!errors.recordName}
                        helperText={errors.recordName?.message}
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
                <FormTextField
                    control={control}
                    name="notes"
                    label="Notes (optional)"
                    fullWidth
                    multiline
                    rows={2}
                />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
                onClick={handleSubmit(handleCreate)}
                variant="contained"
                disabled={isSubmitting}
            >
                {isSubmitting ? <CircularProgress size={20} /> : 'Create'}
            </Button>
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
        return !attendance || attendance === "0"
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
                    {formLinks.map((link, index) => <a key={index} className="text-blue-800 " href={link} target="_blank" rel="noopener noreferrer">
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
    const { enqueueSnackbar } = useSnackbar();
    const { hideMenu, currentColumn } = props;
    const router = useRouter();
    const isRecord = !['studentid','chineseName','englishName','class','gender','enrollmentDate'].includes(currentColumn.field)

    const confirmDelete = () => {
        openDialog({
            children: <>
                <DialogContent>Are you sure you want to delete this record?</DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => {
                        deleteDoc(doc(collection(db, 'attendanceRecords'), currentColumn.description))
                            .then(() => {
                                enqueueSnackbar('Record deleted', { variant: 'success' });
                                closeDialog();
                            })
                            .catch(() => enqueueSnackbar('Failed to delete record', { variant: 'error' }))
                    }}>Delete</Button>
                </DialogActions>
            </>
        })
    }

    const handleArchive = async () => {
        try {
            await updateDoc(doc(db, 'attendanceRecords', currentColumn.description), {
                archived: true
            });
            enqueueSnackbar('Record archived', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to archive record', { variant: 'error' });
        }
        hideMenu(null as any);
    };

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
            <MenuItem onClick={handleArchive}>
                <Archive sx={{ mr: 1, fontSize: 18 }} /> Archive
            </MenuItem>
            <MenuItem onClick={confirmDelete} color="error">Delete</MenuItem>
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
            url: `https://app.cecclphs.com/attendance/print?${selected.map(id => `record=${id}`).join('&')}`,
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
        <DataGridPro
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

// ─── Archived Records Viewer ─────────────────────────────────────────────
const ArchivedRecordsDialog = ({ onClose }: { onClose: () => void }) => {
    const [allRecords = [], loading] = useCollectionData<AttendanceRecord>(
        query(collection(db, "attendanceRecords").withConverter(docConverter), orderBy('startTimestamp', 'desc'))
    );
    const records = useMemo(() => allRecords.filter(r => r.archived === true), [allRecords]);
    const { enqueueSnackbar } = useSnackbar();

    const handleUnarchive = async (recordId: string) => {
        try {
            await updateDoc(doc(db, 'attendanceRecords', recordId), { archived: false });
            enqueueSnackbar('Record unarchived', { variant: 'success' });
        } catch {
            enqueueSnackbar('Failed to unarchive record', { variant: 'error' });
        }
    };

    const columns: GridColDef[] = [
        { field: 'recordName', headerName: 'Name', width: 200 },
        { field: 'recordType', headerName: 'Type', width: 100 },
        {
            field: 'startTimestamp',
            headerName: 'Date',
            width: 150,
            valueGetter: (params) => {
                const ts = params.row.startTimestamp;
                return ts?.toDate ? format(ts.toDate(), 'yyyy-MM-dd HH:mm') : '';
            }
        },
        {
            field: 'studentCount',
            headerName: 'Students',
            width: 80,
            valueGetter: (params) => Object.keys(params.row.students || {}).length
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    startIcon={<Unarchive />}
                    onClick={() => handleUnarchive(params.row.id)}
                >
                    Unarchive
                </Button>
            )
        }
    ];

    return <>
        <DialogTitle>Archived Attendance Records</DialogTitle>
        <DialogContent>
            {loading ? (
                <div className="flex justify-center py-4"><CircularProgress /></div>
            ) : records.length === 0 ? (
                <Alert severity="info" sx={{ my: 2 }}>No archived records</Alert>
            ) : (
                <DataGridPro
                    autoHeight
                    rows={records}
                    columns={columns}
                    getRowId={(row) => row.id}
                    density="compact"
                    disableSelectionOnClick
                />
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </>;
};

// ─── Bulk Archive Dialog ──────────────────────────────────────────────────
const BulkArchiveDialog = ({ onClose }: { onClose: () => void }) => {
    const [allRecords = [], loading] = useCollectionData<AttendanceRecord>(
        query(collection(db, "attendanceRecords").withConverter(docConverter), orderBy('startTimestamp', 'desc'))
    );
    const records = useMemo(() => allRecords.filter(r => r.archived !== true), [allRecords]);
    const [selected, setSelected] = useState<GridSelectionModel>([]);
    const [archiving, setArchiving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleBulkArchive = async () => {
        if (selected.length === 0) return;
        setArchiving(true);
        try {
            const batch = writeBatch(db);
            selected.forEach(id => {
                batch.update(doc(db, 'attendanceRecords', id as string), { archived: true });
            });
            await batch.commit();
            enqueueSnackbar(`Archived ${selected.length} record(s)`, { variant: 'success' });
            setSelected([]);
            onClose();
        } catch {
            enqueueSnackbar('Failed to archive records', { variant: 'error' });
        } finally {
            setArchiving(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'recordName', headerName: 'Name', width: 200 },
        { field: 'recordType', headerName: 'Type', width: 100 },
        {
            field: 'startTimestamp',
            headerName: 'Date',
            width: 150,
            valueGetter: (params) => {
                const ts = params.row.startTimestamp;
                return ts?.toDate ? format(ts.toDate(), 'yyyy-MM-dd HH:mm') : '';
            }
        },
    ];

    return <>
        <DialogTitle>Select Records to Archive</DialogTitle>
        <DialogContent>
            <DataGridPro
                autoHeight
                rows={records}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id}
                checkboxSelection
                density="compact"
                onSelectionModelChange={setSelected}
                selectionModel={selected}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
                onClick={handleBulkArchive}
                variant="contained"
                disabled={archiving || selected.length === 0}
                startIcon={<Archive />}
            >
                {archiving ? 'Archiving...' : `Archive ${selected.length} Record(s)`}
            </Button>
        </DialogActions>
    </>;
};

function CustomToolbar() {
    const [openDialog, closeDialog] = useDialog();

    const handlePrintPDF = () => {
        openDialog({
            children: <PrintPDFDialog onClose={closeDialog}/>
        })
    }

    const handleViewArchived = () => {
        openDialog({
            children: <ArchivedRecordsDialog onClose={closeDialog} />
        });
    };

    const handleBulkArchive = () => {
        openDialog({
            children: <BulkArchiveDialog onClose={closeDialog} />
        });
    };

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
        <Button startIcon={<Archive />} size="small" onClick={handleBulkArchive}>
            Archive Records
        </Button>
        <Button startIcon={<Unarchive />} size="small" onClick={handleViewArchived}>
            View Archived
        </Button>
      </GridToolbarContainer>
    );
  }

//TODO: Breakup this into multiple files
const ViewAttendance = () => {
    const { user } = useAuth()
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const [allRecords = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter), orderBy('startTimestamp','asc')));
    const records = useMemo(() => allRecords.filter(r => r.archived !== true), [allRecords]);
    const [openDialog, closeDialog] = useDialog()

    const handleAddDialog = () => {
        openDialog({
            children: <AddAttendanceRecord onClose={closeDialog}/>,
        })
    }

    const [columns, data] = useMemo(() => {
        if(students.length === 0) return [[] ,[]];

        const baseColumns: GridColDef[] = [
            { field: 'studentid', headerName: 'ID', width: 70, pinnable: true },
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

        const combined = {} as {[studentid: number]: StudentDetails};
        students.forEach(student => {
            combined[student.studentid] = student;
        });
        records.forEach((record, index) => {
            const { id, ref, recordType, recordName, updatedOn, students } = record;
            baseColumns.push({
                field: recordName,
                headerName: recordName,
                description: id,
                editable: true,
                type: 'singleSelect',
                valueOptions: ['1','0','迟','特','事','公','病'],
                hide: (records.length - index) > 5,
                align: 'center'
            })
            Object.keys(students).forEach(studentid => {
                if(!combined[studentid]) return;
                combined[studentid][recordName] = students[studentid];
            })
        })

        return [baseColumns, Object.values(combined)];

    }, [records, students]);

    const processRowUpdate = (newRow: StudentDetails) => {
        //get data of same row
        const oldRow = data.find(row => row.studentid === newRow.studentid);
        //get the updated key and value
        const key = Object.keys(newRow).find(key => newRow[key] !== oldRow[key]);
        const value = newRow[key];
        //update the data
        //get the record from key
        const record = records.find(record => record.recordName === key);
        updateDoc(record.ref, {
            [`students.${newRow.studentid}`]: value
        })
        return newRow
    }

    return <MemberLayout>
        <Page title="View Attendance">
            <Button onClick={handleAddDialog} variant="contained" size="small" sx={{ mb: 1 }}>New Record</Button>
            <DataGridPro
                autoHeight
                loading={studentsLoad || recordsLoad}
                rows={data}
                columns={columns}
                getRowId={(row) => row.studentid}
                experimentalFeatures={{ newEditingApi: true }}
                processRowUpdate={processRowUpdate}
                columnThreshold={2}
                columnBuffer={2}
                density="compact"
                components={{
                    ColumnMenu: GridColumnMenu,
                    Toolbar: CustomToolbar
                }}
                pinnedColumns={{
                    left: ['studentid', 'chineseName', 'englishName', 'class']
                }}
            />
        </Page>
    </MemberLayout>
}

export default ViewAttendance;
