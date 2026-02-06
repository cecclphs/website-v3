import { Button, Menu, MenuItem, Chip, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Typography, Box, Alert, LinearProgress, IconButton } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport, GridSelectionModel, GridRenderCellParams } from "@mui/x-data-grid-pro";
import { collection, doc, query, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRef, useState, useCallback, useMemo } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useSnackbar } from "notistack";
import * as XLSX from "xlsx";
import AddStudentProfile from "../../components/AddStudentProfile";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";
import { useDialog } from "../../hooks/useDialog";
import StudentDetails from "../../types/StudentDetails";
import { Upload, Download } from "@mui/icons-material";

// ─── Excel Upload Dialog ────────────────────────────────────────────────────
type ExcelRow = Record<string, string>;

const ExcelUploadDialog = ({ onClose, students }: { onClose: () => void, students: StudentDetails[] }) => {
    const [file, setFile] = useState<File | null>(null);
    const [sheetData, setSheetData] = useState<ExcelRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ updated: number, notFound: string[] } | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const studentFields = [
        { value: '', label: '-- Skip --' },
        { value: 'studentid', label: 'Student ID (key)' },
        { value: 'englishName', label: 'English Name' },
        { value: 'chineseName', label: 'Chinese Name' },
        { value: 'class', label: 'Class' },
        { value: 'gender', label: 'Gender' },
        { value: 'phone', label: 'Phone' },
        { value: 'email', label: 'Email' },
        { value: 'address', label: 'Address' },
        { value: 'birthday', label: 'Birthday' },
        { value: 'identification', label: 'Identification' },
        { value: 'facebookURL', label: 'Facebook URL' },
        { value: 'motherName', label: "Mother's Name" },
        { value: 'motherPhone', label: "Mother's Phone" },
        { value: 'fatherName', label: "Father's Name" },
        { value: 'fatherPhone', label: "Father's Phone" },
        { value: 'emergencyphone', label: 'Emergency Phone' },
        { value: 'emergencyrelation', label: 'Emergency Relation' },
        { value: 'enrollmentDate', label: 'Enrollment Date' },
        { value: 'committeeRole', label: 'Committee Role' },
        { value: 'specials', label: 'Specials' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });

            if (jsonData.length === 0) {
                enqueueSnackbar('Excel file is empty', { variant: 'error' });
                return;
            }

            const cols = Object.keys(jsonData[0]);
            setHeaders(cols);
            setSheetData(jsonData);

            // Auto-map columns by name similarity
            const autoMap: Record<string, string> = {};
            cols.forEach(col => {
                const lower = col.toLowerCase().replace(/[\s_-]/g, '');
                if (lower.includes('studentid') || lower === 'id' || lower === 'sid') autoMap[col] = 'studentid';
                else if (lower.includes('englishname') || lower === 'name' || lower === 'english') autoMap[col] = 'englishName';
                else if (lower.includes('chinesename') || lower === 'chinese' || lower.includes('中文')) autoMap[col] = 'chineseName';
                else if (lower === 'class' || lower.includes('班级') || lower.includes('kelas')) autoMap[col] = 'class';
                else if (lower === 'gender' || lower.includes('性别')) autoMap[col] = 'gender';
                else if (lower.includes('phone') || lower.includes('电话')) autoMap[col] = 'phone';
                else if (lower.includes('email')) autoMap[col] = 'email';
            });
            setMapping(autoMap);
        };
        reader.readAsBinaryString(f);
    };

    const handleUpload = async () => {
        // Validate that studentid is mapped
        const idColumn = Object.entries(mapping).find(([, v]) => v === 'studentid')?.[0];
        if (!idColumn) {
            enqueueSnackbar('You must map a column to "Student ID" to identify students', { variant: 'error' });
            return;
        }

        // Get columns to update (non-empty, non-studentid)
        const updateFields = Object.entries(mapping).filter(([, v]) => v && v !== 'studentid');
        if (updateFields.length === 0) {
            enqueueSnackbar('No fields selected for update', { variant: 'error' });
            return;
        }

        setUploading(true);
        try {
            const existingIds = new Set(students.map(s => s.studentid));
            let updated = 0;
            const notFound: string[] = [];

            // Process in batches of 500 (Firestore limit)
            const batchSize = 500;
            for (let i = 0; i < sheetData.length; i += batchSize) {
                const chunk = sheetData.slice(i, i + batchSize);
                const batch = writeBatch(db);
                let batchCount = 0;

                for (const row of chunk) {
                    const sid = String(row[idColumn]).trim();
                    if (!sid) continue;

                    if (!existingIds.has(sid)) {
                        notFound.push(sid);
                        continue;
                    }

                    const updateData: Record<string, any> = { modifiedOn: Timestamp.now() };
                    for (const [col, field] of updateFields) {
                        const val = String(row[col] ?? '').trim();
                        if (val) {
                            updateData[field] = field === 'englishName' ? val.toUpperCase() : val;
                        }
                    }

                    batch.update(doc(db, 'students', sid), updateData);
                    batchCount++;
                }

                if (batchCount > 0) {
                    await batch.commit();
                    updated += batchCount;
                }
            }

            setResult({ updated, notFound });
            enqueueSnackbar(`Updated ${updated} student(s)`, { variant: 'success' });
        } catch (error) {
            console.error('Bulk upload error:', error);
            enqueueSnackbar('Failed to upload data', { variant: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return <>
        <DialogTitle>Import Student Data from Excel</DialogTitle>
        <DialogContent>
            <div className="space-y-4 py-2">
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {file ? file.name : 'Choose Excel File'}
                    </Button>
                </div>

                {headers.length > 0 && (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            Found {sheetData.length} rows. Map each column to a student field:
                        </Typography>

                        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                            {headers.map(header => (
                                <div key={header} className="flex items-center gap-3">
                                    <Typography variant="body2" sx={{ minWidth: 150, fontWeight: 500 }}>
                                        {header}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>
                                        e.g. "{String(sheetData[0]?.[header] ?? '').substring(0, 20)}"
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <Select
                                            value={mapping[header] || ''}
                                            onChange={(e) => setMapping(prev => ({ ...prev, [header]: e.target.value }))}
                                            displayEmpty
                                        >
                                            {studentFields.map(f => (
                                                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            ))}
                        </div>

                        <Typography variant="caption" color="text.secondary">
                            The Student ID column is used to match rows to existing students. Other mapped fields will be updated.
                        </Typography>
                    </>
                )}

                {uploading && <LinearProgress />}

                {result && (
                    <div className="space-y-2">
                        <Alert severity="success">Updated {result.updated} student(s)</Alert>
                        {result.notFound.length > 0 && (
                            <Alert severity="warning">
                                {result.notFound.length} student ID(s) not found: {result.notFound.slice(0, 10).join(', ')}
                                {result.notFound.length > 10 && ` and ${result.notFound.length - 10} more`}
                            </Alert>
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
            <Button
                onClick={handleUpload}
                variant="contained"
                disabled={uploading || headers.length === 0}
            >
                {uploading ? 'Uploading...' : 'Update Students'}
            </Button>
        </DialogActions>
    </>;
};

// ─── Custom Toolbar with bulk actions ─────────────────────────────────────
const StudentsToolbar = ({
    selectedIds,
    onBulkStatus,
    onImportExcel,
    bulkLoading
}: {
    selectedIds: string[],
    onBulkStatus: (status: StudentDetails['status']) => void,
    onImportExcel: () => void,
    bulkLoading: boolean
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarExport />
            <Button startIcon={<Upload />} size="small" onClick={onImportExcel}>
                Import Excel
            </Button>

            {selectedIds.length > 0 && (
                <>
                    <Chip
                        label={`${selectedIds.length} selected`}
                        size="small"
                        sx={{ ml: 1 }}
                    />
                    <Button
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        disabled={bulkLoading}
                    >
                        Bulk Change Status
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={() => { onBulkStatus('enrolled'); setAnchorEl(null); }}>
                            Set as Enrolled
                        </MenuItem>
                        <MenuItem onClick={() => { onBulkStatus('graduated'); setAnchorEl(null); }}>
                            Set as Graduated
                        </MenuItem>
                        <MenuItem onClick={() => { onBulkStatus('transfered'); setAnchorEl(null); }}>
                            Set as Transferred
                        </MenuItem>
                    </Menu>
                </>
            )}
        </GridToolbarContainer>
    );
};

// ─── Main Students Page ───────────────────────────────────────────────────
const Students = () => {
    const [statusFilter, setStatusFilter] = useState<StudentDetails['status']>('enrolled');
    const [students = [], loading, error] = useCollectionData<StudentDetails>(
        query(collection(db, 'students').withConverter(docConverter), where('status', '==', statusFilter))
    );
    const [openDialog, closeDialog] = useDialog();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleCreateStudent = () => {
        openDialog({
            children: <AddStudentProfile onClose={closeDialog}/>
        });
    };

    const handleImportExcel = () => {
        openDialog({
            children: <ExcelUploadDialog onClose={closeDialog} students={students} />
        });
    };

    const handleBulkStatusChange = async (newStatus: StudentDetails['status']) => {
        if (selectedIds.length === 0) return;
        setBulkLoading(true);
        try {
            const batch = writeBatch(db);
            selectedIds.forEach(id => {
                batch.update(doc(db, 'students', id), {
                    status: newStatus,
                    modifiedOn: Timestamp.now()
                });
            });
            await batch.commit();
            enqueueSnackbar(`Updated ${selectedIds.length} student(s) to ${newStatus}`, { variant: 'success' });
            setSelectedIds([]);
        } catch (error) {
            console.error('Bulk update error:', error);
            enqueueSnackbar('Failed to update students', { variant: 'error' });
        } finally {
            setBulkLoading(false);
        }
    };

    const processRowUpdate = useCallback(async (newRow: StudentDetails, oldRow: StudentDetails) => {
        // Find what changed
        const changes: Record<string, any> = {};
        const editableFields = ['englishName', 'chineseName', 'class', 'gender', 'phone', 'email',
            'address', 'birthday', 'identification', 'facebookURL', 'enrollmentDate',
            'motherName', 'motherPhone', 'fatherName', 'fatherPhone',
            'emergencyphone', 'emergencyrelation', 'specials', 'committeeRole', 'status'] as const;

        for (const field of editableFields) {
            if (newRow[field] !== oldRow[field]) {
                changes[field] = field === 'englishName' ? String(newRow[field]).toUpperCase() : newRow[field];
            }
        }

        if (Object.keys(changes).length === 0) return oldRow;

        try {
            await updateDoc(doc(db, 'students', newRow.studentid), {
                ...changes,
                modifiedOn: Timestamp.now()
            });
            return newRow;
        } catch (error) {
            console.error('Row update error:', error);
            enqueueSnackbar('Failed to save changes', { variant: 'error' });
            return oldRow;
        }
    }, [enqueueSnackbar]);

    const columns: GridColDef[] = useMemo(() => [
        { field: 'studentid', headerName: 'ID', width: 70 },
        { field: 'chineseName', headerName: '名字', width: 80, editable: true },
        { field: 'englishName', headerName: 'Name', width: 150, editable: true },
        { field: 'class', headerName: 'Class', width: 80, editable: true },
        { field: 'gender', headerName: 'Gender', width: 80, editable: true, type: 'singleSelect', valueOptions: ['Male', 'Female'] },
        { field: 'enrollmentDate', headerName: 'Enrolled', width: 110, editable: true },
        { field: 'phone', headerName: 'Phone', editable: true },
        { field: 'emergencyphone', headerName: 'Emergency Phone', editable: true },
        { field: 'identification', headerName: 'Identification', editable: true },
        { field: 'email', headerName: 'Email', editable: true },
        { field: 'address', headerName: 'Address', editable: true },
        { field: 'birthday', headerName: 'Birthday', editable: true },
        { field: 'motherName', headerName: 'Mother Name', editable: true },
        { field: 'motherPhone', headerName: 'Mother Phone', editable: true },
        { field: 'fatherName', headerName: 'Father Name', editable: true },
        { field: 'fatherPhone', headerName: 'Father Phone', editable: true },
        { field: 'emergencyrelation', headerName: 'Emergency Relation', editable: true },
        { field: 'specials', headerName: 'Specials', editable: true },
        { field: 'committeeRole', headerName: 'Committee Role', editable: true },
        { field: 'facebookURL', headerName: 'Facebook', editable: true },
        { field: 'linkedAccounts', headerName: 'Accounts', valueGetter: (params) => params.row.linkedAccounts?.length ?? 0 },
        { field: 'status', headerName: 'Status', editable: true, type: 'singleSelect', valueOptions: ['enrolled', 'graduated', 'transfered'] },
        { field: 'actions', headerName: "", width: 80, sortable: false, filterable: false, renderCell: (params: GridRenderCellParams) => (
            <Button
                size="small"
                variant="contained"
                onClick={() => router.push(`/students/${params.row.studentid}`)}
            >
                Open
            </Button>
        )}
    ], [router]);

    return <MemberLayout>
        <Page title="Students">
            <div className="flex gap-2 mb-2 items-center flex-wrap">
                <Button onClick={handleCreateStudent} variant="contained" size="small">Add Student</Button>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status Filter"
                        onChange={(e) => setStatusFilter(e.target.value as StudentDetails['status'])}
                    >
                        <MenuItem value="enrolled">Enrolled</MenuItem>
                        <MenuItem value="graduated">Graduated</MenuItem>
                        <MenuItem value="transfered">Transferred</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <DataGridPro
                loading={loading}
                autoHeight
                rows={students}
                columns={columns}
                checkboxSelection
                disableSelectionOnClick
                getRowId={(row) => row.studentid}
                density="compact"
                experimentalFeatures={{ newEditingApi: true }}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error('Row update error:', error)}
                onSelectionModelChange={(model: GridSelectionModel) => setSelectedIds(model as string[])}
                selectionModel={selectedIds}
                components={{
                    Toolbar: StudentsToolbar
                }}
                componentsProps={{
                    toolbar: {
                        selectedIds,
                        onBulkStatus: handleBulkStatusChange,
                        onImportExcel: handleImportExcel,
                        bulkLoading
                    }
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
                        status: true,
                      },
                    },
                  }}
                pinnedColumns={{
                    left: ['__check__', 'studentid', 'chineseName', 'englishName', 'class']
                }}
            />
        </Page>
    </MemberLayout>
}

export default Students;
