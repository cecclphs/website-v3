import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, docConverter } from '../../../config/firebase';
import { useCollectionData, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import StudentDetails from '../../../types/StudentDetails';
import { useAuth } from '../../../hooks/useAuth';
import MemberLayout from '../../../components/MemberLayout';
import Page from '../../../components/Page';
import { Button, Checkbox, FormControlLabel, FormGroup, Grow } from '@mui/material';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import preloadImage from '../../../utils/preloadImage';
import { AttendanceRecord } from '../../../types/Attendance';
import useToggle from '../../../hooks/useToggle';
import { NextPage } from 'next';

const AttendanceCallout: NextPage = () => {
    const { user } = useAuth()
    const router = useRouter();
    const { recordId } = router.query;
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const [calloutIndex, setCalloutIndex] = useState(0);
    const [begin, setBegin] = useToggle(false);
    const [absents, setAbsents] = useState<number>(0);
    const [filterBy, setFilterBy] = useState<string[]>([])
    const [attendance, loading, error] = useDocumentDataOnce<AttendanceRecord>(recordId && doc(db, `attendanceRecords/${recordId}`).withConverter(docConverter));
    const { students: alreadyCalled, recordName } = attendance || { };

    const calloutStudents = useMemo(() => {
        return alreadyCalled?
            students.filter(s => !Object.keys(alreadyCalled || {}).includes(s.id) && filterBy.includes(s.class.substring(0,2)))
            : students
    }, [students, alreadyCalled, filterBy]);

    useEffect(() => {
        if(!begin) return;
        calloutStudents.forEach(({studentid}) => {
            preloadImage(`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`)
        })
    },[calloutStudents, begin])

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

    const handleFilterCheckbox = (str: string) => 
        (e: ChangeEvent<HTMLInputElement>) => {
            if(e.target.checked) {
                setFilterBy([...filterBy, str])
            } else {
                setFilterBy(filterBy.filter(s => s != str))
            }
        }
    const { studentid, englishName, chineseName, class: className, gender } = calloutStudents[calloutIndex] || {};
    const filters = ["J1", "F1", "J2", "F2", "J3", "F3", "S1", "F4","S2","F5", "S3"] 
    return <MemberLayout>
        <Page title="Attendance Callout">
            <h1 className='pb-2'>Attendance for {recordName}</h1>
            <Grow
                in={!begin}
                unmountOnExit
            >
                <div className="grid place-items-center h-full w-full">
                    <h2>Which grades to take attendance?</h2>
                    <FormGroup>
                    {filters.map(str => <FormControlLabel control={<Checkbox checked={filterBy.includes(str)} onChange={handleFilterCheckbox(str)}/>} label={str} />)}
                    </FormGroup>
                    <Button onClick={setBegin}>Begin</Button>
                </div>
            </Grow>
            <Grow
                in={begin && !isFinished}
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
                        <Button color="info" size="large" variant="contained" onClick={() => setCalloutIndex(calloutIndex + 1)}>Skip</Button>
                        <Button color="error" size="large" variant="contained" onClick={() => updateRecord(calloutStudents[calloutIndex], false)}>Absent</Button>
                        <Button color="success" size="large" variant="contained" onClick={() => updateRecord(calloutStudents[calloutIndex], true)}>Present</Button>
                    </div>
                </div>
            </Grow>
            <Grow
                in={begin && isFinished}
                unmountOnExit
            >
                <div className="flex flex-col w-full items-center">
                    <h1 className='text-2xl font-semibold'>Complete!</h1>
                </div>
            </Grow>
        </Page>
    </MemberLayout>
}

export default AttendanceCallout;