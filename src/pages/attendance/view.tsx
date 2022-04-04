import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import MUIDataTable from "mui-datatables";
import { collection, DocumentReference, query, Timestamp, where } from "firebase/firestore";
import { db, docConverter } from "../../config/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useMemo } from "react";
import StudentDetails from "../../types/StudentDetails";
import { ShortStudentInfo } from "../../types/User";

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
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const [records = [], recordsLoad, recordsError] = useCollectionData<AttendanceRecord>(query(collection(db, "attendanceRecords").withConverter(docConverter)));
    //TODO: Cache Students so doesn't have to load everytime.
    const baseColumns = [
        {
            name: "studentid",
            label: "Student ID",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "class",
            label: "Class",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "chineseName",
            label: "Chinese Name",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "englishName",
            label: "English Name",
            options: {
                filter: true,
                sort: true,
            }
        },
    ];

    const [columns, data] = useMemo(() => {
        if(students.length == 0) return [[] ,[]];
        const combined = {} as {[studentid: number]: StudentDetails};
        students.forEach(student => {
            combined[student.id] = student;
        });
        records.forEach(record => {
            const { id, ref, recordType, recordName, createdBy, createdOn, updatedOn, students } = record;
            baseColumns.push({
                name: recordName,
                label: recordName,
                options: {
                    filter: true,
                    sort: false,
                }
            })
            Object.keys(students).forEach(studentid => {
                if(!combined[studentid]) return;
                combined[studentid][recordType] = students[studentid];
            })
        })

        return [baseColumns, Object.values(combined)];
        
    }, [records, students]);
    console.log([columns, data]);
    const options = {
        filterType: 'checkbox',
    };

    return <MemberLayout>
        <Page title="View Attendance">
            <MUIDataTable
                title={"Attendance Records"}
                data={data}
                columns={columns}
                options={options}
            />
        </Page>
    </MemberLayout>
}

export default ViewAttendance;
