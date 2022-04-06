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
        if (!urlquery?.event) {
            router.push('/attendance/view');
        }
    }, [urlquery])

    const updateRecord = (student: StudentDetails, present:boolean) => {
        updateDoc(doc(db, `attendanceRecords/${eventid}`), {
            [`students.${student.studentid}`]: present?'1':'0'
        })
        setCalloutIndex(calloutIndex+1);
    }

    const { studentid, englishName, chineseName, class: className, gender } = students[calloutIndex]

    return <MemberLayout>
        <Page title="Attendance Callout">
            <Grow
                in={true}
                style={{ transformOrigin: '0 0 0' }}
                unmountOnExit
            >
                <div className="flex flex-col p-3 rounded-lg shadow-md items-center">
                    <img 
                        className="rounded-full h-12 w-12"
                        src={`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`}
                        />
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-lg font-medium">{englishName}</h1>
                        <h2 className="text-sm font-medium">{chineseName}</h2>
                        <h3 className="text-sm font-medium">{className}</h3>
                        <h3 className="text-sm font-medium">{gender}</h3>
                    </div>
                    <div className="flex flex-row justify-around">
                        <Button>Absent</Button>
                        <Button>Present</Button>
                    </div>
                </div>
            </Grow>
        </Page>
    </MemberLayout>
}

export default AttendanceCallout;