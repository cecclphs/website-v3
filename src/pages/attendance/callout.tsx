import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import StudentDetails from '../../types/StudentDetails';
import { useAuth } from '../../hooks/useAuth';
import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import { Button, Grow, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AttendanceCallout = () => {
    const { user } = useAuth()
    const router = useRouter();
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const urlquery = router.query;
    const eventid = urlquery.eventid;
    const [calloutIndex, setCalloutIndex] = useState(0);

    useEffect(() => {
        if (!eventid) {
            // router.push('/attendance/view');
        }
    }, [eventid])

    const updateRecord = (student: StudentDetails, present:boolean) => {
        updateDoc(doc(db, `attendanceRecords/${eventid}`), {
            [`students.${student.studentid}`]: present?'1':'0'
        })
        setCalloutIndex(calloutIndex+1);
    }

    const { studentid, englishName, chineseName, class: className, gender } = students[calloutIndex] || {};

    return <MemberLayout>
        <Page title="Attendance Callout">
            <h1>Attendance for {"12/11"}</h1>
            <Grow
                in={true}
                style={{ transformOrigin: '0 0 0' }}
                unmountOnExit
            >
                <div className="flex flex-col p-3 rounded-lg shadow-md items-center space-y-2">
                    <img 
                        className="rounded-full h-28 w-28"
                        src={`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`}
                        />
                    <div className="flex flex-col space-y-2 items-center">
                        <h1 className="text-lg font-semibold">{englishName} {chineseName}</h1>
                    </div>
                    <div className="flex flex-col space-y-2 items-center">
                        <h3 className="text-sm font-medium">{studentid} {className}</h3>
                        <h3 className="text-sm font-medium">{gender}</h3>
                    </div>
                    <div className="flex flex-row justify-around">
                        <Button color="error" size="large" onClick={() => updateRecord(students[calloutIndex], false)}>Absent</Button>
                        <Button color="success" size="large" onClick={() => updateRecord(students[calloutIndex], true)}>Present</Button>
                    </div>
                </div>
            </Grow>
        </Page>
    </MemberLayout>
}

export default AttendanceCallout;