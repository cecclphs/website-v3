import { formatInTimeZone } from 'date-fns-tz'
import { Timestamp as ServerTimestamp } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { adminConverter, adminDb } from "../../config/firebase-admin";
import { useAuth } from "../../hooks/useAuth";
import { AttendanceRecord, AttendanceValue, CardScannedRecord } from "../../types/Attendance";
import StudentDetails from "../../types/StudentDetails";
import superjson from 'superjson';

type PrintAttendanceProps = {
    attendance: (Omit<AttendanceRecord, 'students' | 'ref'> & {
        students: {
            [studid: string]: {
                in: Timestamp,
                out?: Timestamp,
                status: '1'
            } | {
                status: Omit<AttendanceValue, '1'>
            }
        }
    })[],
    students: Pick<StudentDetails, 'studentid' | 'chineseName' | 'englishName' | 'class' | 'enrollmentDate' | 'gender'>[],
}

const PrintAttendance: NextPage<{ stringified: string }> = ({ stringified }) => {
    const { user, userDetails } = useAuth();
    superjson.registerCustom<Timestamp, string>(
        {
        isApplicable: (value): value is Timestamp => value instanceof Timestamp,
        serialize: (value) => value.toDate().toISOString(),
        deserialize: (value) => Timestamp.fromDate(new Date(value)),
        },
        'firebase-admin/firestore'
    )
    const { attendance, students } = superjson.parse<PrintAttendanceProps>(stringified);

    const getPresent = (recArr: PrintAttendanceProps['attendance'][number]['students'][string]) => {
        return recArr.status == '1' && recArr as {
            in: Timestamp,
            out?: Timestamp,
            status: '1'
        }
    }

    return <div className="min-h-[21cm] w-[29.7cm] flex flex-col px-8 pt-4  overflow-x-hidden">
        <div className="grid grid-cols-[12rem_auto_12rem] pb-8">
            <img src="/cec-logo-gradient-black.png" className="w-28" />
            <div className="text-center">
                <h1 className="text-xl font-semibold text-black">Attendance Record</h1>
                <p>电子创意学会 Creative Electronics Club</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-400">{userDetails?.englishName}</p>
                <p className="text-sm font-medium text-gray-400">{formatInTimeZone(new Date(), 'Asia/Kuala_Lumpur',"yyyy-MM-dd HH:mm:ss")}</p>
            </div>
        </div>
        {/* TABLE IS | 学号 | 名字 | Name | Record -> |In | Out| | */}
        <table className="border-collapse border border-neutral-700 h-full">
            <thead className="break-inside-avoid">
                <tr>
                    <th className="border border-neutral-700 w-20 text-sm">学号</th>
                    <th className="border border-neutral-700 w-24 text-sm">名字</th>
                    <th className="border border-neutral-700 w-[200px] text-sm">Name</th>
                    {attendance.map(record => <th className="border border-neutral-700 w-24 h-full">
                        <p className="text-gray-600 text-sm">{record.recordName}</p>
                        <div className="w-full flex flex-row border-t border-neutral-300 divide-x divide-neutral-300">
                            <p className="flex-1 font-normal text-sm text-gray-600 h-full">IN</p>
                            <p className="flex-1 font-normal text-sm text-gray-600 h-full">OUT</p>
                        </div>
                    </th>)}
                </tr>
            </thead>
            <tbody className="h-full">
                {students.map(student => <tr className="h-full">
                    <td className="border border-neutral-700 text-sm text-center">{student.studentid}</td>
                    <td className="border border-neutral-700 text-sm text-center">{student.chineseName}</td>
                    <td className="border border-neutral-700 text-sm pl-1">{student.englishName}</td>
                    {attendance.map(attendance => {
                        const attdrec = attendance.students[student.studentid];
                        return <td className="border border-neutral-700 h-full text-center">
                            {attdrec.status === '1' ? <div className="h-full w-full flex flex-row divide-x divide-neutral-300 text-center items-center">
                                <p className="flex-1 font-normal text-sm text-gray-600 h-full grid place-items-center">{formatInTimeZone(getPresent(attdrec).in.toDate(), 'Asia/Kuala_Lumpur', "HH:mm")}</p>
                                <p className="flex-1 font-normal text-sm text-gray-600 h-full grid place-items-center">{!!getPresent(attdrec).out?formatInTimeZone(getPresent(attdrec).out.toDate(), 'Asia/Kuala_Lumpur', "HH:mm"):'-'}</p>
                            </div>: <p className="text-sm text-gray-600">{attdrec.status || '-'}</p>}
                        </td>
                    })}
                </tr>)}
            </tbody>
        </table>
    </div>
}

// export const getServerSideProps: GetServerSideProps = async ({ res, req, query }) => { 
//     return {
//         props: {
//             stringified: (await readFile('attendance.json')).toString()
//         }
//     };
// }

export const getServerSideProps: GetServerSideProps = async ({ res, req, query }) => {
    //check auth
    console.log(res.getHeader('Authorization'))
    const { record: _record } = query;
    const record = typeof _record === 'string' ? [_record] : _record;
    // const attdDocs = (await adminDb
    //     .collection('attendanceRecords').withConverter(adminConverter)
    //     .where('startTimestamp', '>=', ServerTimestamp.fromDate(parseISO(from)))
    //     .where('startTimestamp', '<=', ServerTimestamp.fromDate(parseISO(to)))
    //     .where('recordType', '==', 'activity')
    //     .orderBy('startTimestamp', 'asc')
    //     .limit(6)
    //     .get()
    // ).docs.map(doc => doc.data() as AttendanceRecord);
    //get attend records following records array id
    const attdRecRef = adminDb.collection('attendanceRecords').withConverter(adminConverter);
    const attdDocs = (await Promise.all(record.map(id => attdRecRef.doc(id).get()))).map(doc => doc.data() as AttendanceRecord);

    const studDocs = (await adminDb
        .collection('students')
        .where('status', '==', 'enrolled')
        .orderBy('studentid', 'asc')
        .get()
    ).docs.map(doc => {
        const data = doc.data()
        return {
            studentid: data.studentid,
            chineseName: data.chineseName,
            englishName: data.englishName,
            class: data.class,
            enrollmentDate: data.enrollmentDate,
            gender: data.gender
        } as PrintAttendanceProps['students'][number]
    });

    // const attdDocsWithHistory = await Promise.all(attdDocs.map(async attd => {
    //     const history = (await getDocs(query(
    //         collection(attd.ref, 'scanned'),
    //         orderBy('scannedOn', 'asc')
    //     ))).docs.map(doc => doc.data() as CardScannedRecord);
    //     return { ...attd, history };
    // }));
    const attdDocsWithHistory = await Promise.all(attdDocs.map(async attd => {
        const history = (await adminDb
            .doc(attd.ref.path)
            .collection('scanned')
            .orderBy('scannedOn', 'asc')
            .get()
        ).docs.map(doc => ({id: doc.id, ...doc.data()} as (CardScannedRecord & {id: string})));
        return { ...attd, history };
    }));

    const attndRecords = attdDocsWithHistory.map(attd => {
        const { history, ref, ...record } = attd;
        const students: PrintAttendanceProps['attendance'][number]['students'] = {};
        for (const stud of studDocs) {
            //get the 1st scanned document for each student
            const indoc = history.find(doc => doc.studentid === stud.studentid);
            //get the last scanned document
            let outdoc = history.slice().sort((a, b) => b.scannedOn.toDate().getTime() - a.scannedOn.toDate().getTime()).find(doc => doc.studentid === stud.studentid);
            if(indoc?.id == outdoc?.id) {
                //outdoc is the same as indoc, so no out
                outdoc = undefined;
            }
            //if outdoc scanned time is is within 5 minutes of indoc scanned time, ignore outdoc
            if(outdoc?.scannedOn.toDate().getTime() - indoc?.scannedOn.toDate().getTime() < 300000) {
                outdoc = undefined;
            }
            if (record.students[stud.studentid] === '1') {
                students[stud.studentid] = {
                    //@ts-ignore
                    in: indoc?.scannedOn || record.startTimestamp,
                    //@ts-ignore
                    out: outdoc? outdoc.scannedOn: (!indoc?.scannedOn ? record.endTimestamp : undefined),
                    status: '1'
                }
            }
            else {
                students[stud.studentid] = {
                    status: record.students[stud.studentid]
                }
            }
        }
        return { ...record, students } as PrintAttendanceProps['attendance'][number];
    })
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )

    
    superjson.registerCustom<ServerTimestamp, string>(
        {
            isApplicable: (value): value is ServerTimestamp => value instanceof ServerTimestamp,
            serialize: (value) => value.toDate().toISOString(),
            deserialize: (value) => ServerTimestamp.fromDate(new Date(value)),
        },
        'firebase-admin/firestore'
    )

    // await writeFile('attendance.json', superjson.stringify({
    //     attendance: attndRecords,
    //     students: studDocs
    // }));
    
    return {
        props: {
            stringified: superjson.stringify({
                attendance: attndRecords,
                students: studDocs
            })
        }
    };
}

export default PrintAttendance;