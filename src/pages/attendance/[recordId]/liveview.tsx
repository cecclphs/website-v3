import {collection, query, where, doc} from 'firebase/firestore';
import {db, docConverter} from '../../../config/firebase';
import {useCollectionData, useDocumentData} from 'react-firebase-hooks/firestore';
import StudentDetails from '../../../types/StudentDetails';
import {AttendanceRecord} from '../../../types/Attendance';
import { format, formatDistanceToNow } from 'date-fns';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import {useRouter} from 'next/router';
import { Tooltip } from '@mui/material';

const MatrixDot = ({studentid, englishName, chineseName, attendance = null}: {studentid: string, englishName: string, chineseName: string, attendance: AttendanceRecord['students'][0] | null}) => {
    const color = {
        '1': 'bg-green-600/80',
        '0': 'bg-red-500',
        null: 'bg-gray-300'
    }
    return <Tooltip title={`${studentid} ${chineseName} ${englishName}`}>
        <div className={`w-6 h-6 ${color[attendance]}`}></div>
    </Tooltip>
}
const LiveAttendance = () => {
    const router = useRouter();
    const { recordId } = router.query;
    const [students = [], studentsLoad, studentsError] = useCollectionData<StudentDetails>(query(collection(db, "students").withConverter(docConverter), where('status', '==', 'enrolled')));
    const [attendance, loading, error] = useDocumentData<AttendanceRecord>(recordId && doc(db, `attendanceRecords/${recordId}`).withConverter(docConverter));
    const { students: recStud, recordName } = attendance || { };

    const attendsort = ['1','迟','特','事','公','0', null]
    const sortedRec = useMemo(() => {
        if(!loading && !studentsLoad && recStud) 
        return students.slice().sort((a,b) => {
            return attendsort.indexOf(recStud[a.studentid] || null) - attendsort.indexOf(recStud[b.studentid] || null)
        })
    }, [recStud, students])
    const attendees = useMemo(() => {
        if(!loading && !studentsLoad && recStud) 
            return students.filter(s => recStud[s.id] == '1')
    }, [students, recStud, loading, studentsLoad])
    const absentees = useMemo(() => {
        if(!loading && !studentsLoad && attendees) 
            return students.filter(s => !attendees.includes(s))
    }, [students, attendees, loading, studentsLoad]);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const intv = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(intv)
    },[])

    if(loading || studentsLoad || !recStud) return <div className="w-screen h-screen grid place-items-center">
        <h1 className="text-4xl text-gray-400">Loading...</h1>
    </div>

    return <div className="flex flex-col w-screen h-screen overflow-hidden p-4">
        <Head>
            <title>{attendance?.recordName} Live View</title>
        </Head>
        <div className="flex flex-row w-full mb-4">
            <div className="w-48"></div>
            <div className="items-center text-center flex-1">
                <h1 className="text-2xl font-semibold">Attendance for {attendance?.recordName}</h1>
                <h2 className="text-base font-medium">Activity start {attendance?.startTimestamp?formatDistanceToNow(attendance?.startTimestamp?.toDate(), { addSuffix: true}):""}</h2>
            </div>
            <div className="w-48 text-right">
                <div className="font-mono text-2xl">
                    {format(now, 'hh:mm:ss a')}
                </div>
            </div>
        </div>
        <div className="flex flex-row w-full justify-evenly space-x-4 h-full overflow-hidden">
            <div className="space-y-1">
                <h3 className='font-semibold text-xl'>Attendance Matrix</h3>
                <div className="grid grid-cols-10 gap-1 auto-rows-auto">
                    {sortedRec.map(s => <MatrixDot key={s.id} studentid={s.id} englishName={s.englishName} chineseName={s.chineseName} attendance={recStud[s.id] || null}/>)}
                </div>
            </div>
            <div className="space-y-1 overflow-y-auto min-w-[300px]">
                <h3 className='font-semibold text-xl'>Absentees</h3>
                <div className="flex flex-col">
                    {absentees.map(({studentid, englishName, chineseName, class: className}) => <p><span className="font-mono">{studentid}</span> {chineseName} {className}</p>)}
                </div>
            </div>
        </div>
    </div>
}

export default LiveAttendance;