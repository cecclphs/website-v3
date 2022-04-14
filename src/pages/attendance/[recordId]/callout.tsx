import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, docConverter } from '../../../config/firebase';
import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import StudentDetails from '../../../types/StudentDetails';
import { useAuth } from '../../../hooks/useAuth';
import MemberLayout from '../../../components/MemberLayout';
import Page from '../../../components/Page';
import { Button, Grow } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import preloadImage from '../../../utils/preloadImage';
import { AttendanceRecord } from '../../../types/Attendance';

const AttendanceCallout = () => {
    const { user } = useAuth()
    const router = useRouter();
    const { recordId } = router.query;
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const [calloutIndex, setCalloutIndex] = useState(0);
    const [absents, setAbsents] = useState<number>(0);
    const [attendance, loading, error] = useDocumentDataOnce<AttendanceRecord>(recordId && doc(db, `attendanceRecords/${recordId}`).withConverter(docConverter));
    const { students: alreadyCalled, recordName } = attendance || { };

    const calloutStudents = useMemo(() => alreadyCalled?students.filter(s => !Object.keys(alreadyCalled || {}).includes(s.id)): students, [students, alreadyCalled]);

    useEffect(() => {
        calloutStudents.forEach(({studentid}) => {
            preloadImage(`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`)
        })
    },[calloutStudents])

    const updateRecord = (student: StudentDetails, present:boolean) => {
        updateDoc(doc(db, `attendanceRecords/${recordId}`), {
            [`students.${student.studentid}`]: present?'1':'0'
        })
        setAbsents(absents + (present?0:1))
        setCalloutIndex(calloutIndex+1);
    }

    const isFinished = calloutIndex == calloutStudents.length
    useEffect(() => {
        if(loading && studentsLoad && isFinished) {
            // router.push('/attendance/view');
        }
    }, [calloutIndex, studentsLoad, loading, isFinished])
    const { studentid, englishName, chineseName, class: className, gender } = calloutStudents[calloutIndex] || {};

    return <MemberLayout>
        <Page title="Attendance Callout">
            <h1 className='pb-2'>Attendance for {recordName}</h1>
            <Grow
                in={!isFinished}
                unmountOnExit
            >
                <div className="flex flex-col p-3 rounded-lg shadow-md items-center space-y-2 min-h-[300px]">
                    <div className="flex flex-col space-y-2 items-center flex-1">
                        <img 
                            className="rounded-full h-28 w-28 object-cover"
                            src={`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src="/user_image.jpg";
                            }}
                            
                            />
                        <div className="flex flex-col items-center">
                            <h1 className="text-lg font-semibold">{chineseName}</h1>
                            <h1 className="text-lg font-semibold">{englishName}</h1>
                            <h3 className="text-sm font-medium">{studentid} {className}</h3>
                            <h3 className="text-sm font-medium">{gender}</h3>
                        </div>
                    </div>
                    <div className="flex flex-row justify-around space-x-1">
                        <Button color="error" size="large" variant="contained" onClick={() => updateRecord(calloutStudents[calloutIndex], false)}>Absent</Button>
                        <Button color="success" size="large" variant="contained" onClick={() => updateRecord(calloutStudents[calloutIndex], true)}>Present</Button>
                    </div>
                </div>
            </Grow>
            <Grow
                in={isFinished}
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