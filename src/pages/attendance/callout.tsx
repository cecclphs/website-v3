import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import StudentDetails from '../../types/StudentDetails';
import { useAuth } from '../../hooks/useAuth';
import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import { Button, Grow } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import preloadImage from '../../utils/preloadImage';
import { AttendanceRecord } from '../../types/Attendance';

const AttendanceCallout = () => {
    const { user } = useAuth()
    const router = useRouter();
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const urlquery = router.query;
    const eventid = urlquery.eventid;
    const [calloutIndex, setCalloutIndex] = useState(0);
    const [absents, setAbsents] = useState<number>(0);
    const [attendance, loading, error] = useDocumentDataOnce<AttendanceRecord>(doc(db, `attendanceRecords/${eventid}`).withConverter(docConverter));
    
    useEffect(() => {
        if (!eventid) {
            // router.push('/attendance/view');
        }
    }, [eventid])

    useEffect(() => {
        students.forEach(({studentid}) => {
            preloadImage(`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`)
        })
    },[students])

    const updateRecord = (student: StudentDetails, present:boolean) => {
        updateDoc(doc(db, `attendanceRecords/${eventid}`), {
            [`students.${student.studentid}`]: present?'1':'0'
        })
        setAbsents(absents + (present?0:1))
        setCalloutIndex(calloutIndex+1);
    }

    const isFinished = calloutIndex == students.length

    const { studentid, englishName, chineseName, class: className, gender } = students[calloutIndex] || {};

    return <MemberLayout>
        <Page title="Attendance Callout">
            <h1>Attendance for {"12/11"}</h1>
            <Grow
                in={!isFinished}
                style={{ transformOrigin: '0 0 0' }}
                unmountOnExit
            >
                <div className="flex flex-col p-3 rounded-lg shadow-md items-center space-y-2 min-h-[300px]">
                    <div className="flex flex-col space-y-2 items-center flex-1">
                        <img 
                            className="rounded-full h-28 w-28 object-cover"
                            src={`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`}
                            />
                        <div className="flex flex-col items-center">
                            <h1 className="text-lg font-semibold">{chineseName}</h1>
                            <h1 className="text-lg font-semibold">{englishName}</h1>
                            <h3 className="text-sm font-medium">{studentid} {className}</h3>
                            <h3 className="text-sm font-medium">{gender}</h3>
                        </div>
                    </div>
                    <div className="flex flex-row justify-around">
                        <Button color="error" size="large" onClick={() => updateRecord(students[calloutIndex], false)}>Absent</Button>
                        <Button color="success" size="large" onClick={() => updateRecord(students[calloutIndex], true)}>Present</Button>
                    </div>
                </div>
            </Grow>
            <Grow
                in={isFinished}
                style={{ transformOrigin: '0 0 0' }}
                unmountOnExit
            >
                <div className="flex flex-col w-full items-center">
                    <h1 className='text-2xl font-semibold'>Complete!</h1>
                    <p>{absents} students absent</p>
                </div>
            </Grow>
        </Page>
    </MemberLayout>
}

export default AttendanceCallout;