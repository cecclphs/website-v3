import { formatInTimeZone } from 'date-fns-tz'
import { Timestamp as ServerTimestamp } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { adminConverter, adminDb } from "../../config/firebase-admin";
import { useAuth } from "../../hooks/useAuth";
import superjson from 'superjson';
import StudentDetails from '../../types/StudentDetails';

type Props = {
    students: StudentDetails[]
}

type PropsString = { stringified?: string, error?: string }

const NameListExport: NextPage<PropsString> = ({ stringified, error }) => {
    const { user, userDetails } = useAuth();

    if(error) return <div className='h-screen w-screen grid place-items-center text-2xl'>{error}</div>;

    superjson.registerCustom<Timestamp, string>(
        {
        isApplicable: (value): value is Timestamp => value instanceof Timestamp,
        serialize: (value) => value.toDate().toISOString(),
        deserialize: (value) => Timestamp.fromDate(new Date(value)),
        },
        'firebase-admin/firestore'
    )
    const { students } = superjson.parse<Props>(stringified);

    return <div className="min-h-[29.7cm] w-[21cm] flex flex-col px-8 pt-4  overflow-x-hidden">
        <div className="grid grid-cols-[12rem_auto_12rem] pb-4">
            <img src="/cec-logo-gradient-black.png" className="w-28" />
            <div className="text-center">
                <h1 className="text-xl font-semibold text-black">团体会员名单 Members Namelist</h1>
                <p>电子创意学会 Creative Electronics Club</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-400">Printed On:</p>
                <p className="text-sm font-medium text-gray-400">{formatInTimeZone(new Date(), 'Asia/Kuala_Lumpur',"yyyy-MM-dd HH:mm:ss")}</p>
            </div>
        </div>
        <p className='text-sm text-gray-600'>会员 Members: {students.length}位</p>
        {/* 序号	学号	姓名	NAME	班级 */}
        <table className="border-collapse border border-neutral-700 h-full">
            <thead className="break-inside-avoid">
                <tr className="[&_td]:border [&_td]:border-neutral-700 [&_td]:text-xs [&_td]:text-center [&_td]:font-semibold [&_td]:whitespace-nowrap">
                    <td>序号</td>
                    <td>学号</td>
                    <td>姓名</td>
                    <td>NAME</td>
                    <td>班级</td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                    <td className='w-[0.8cm]'></td>
                </tr>
            </thead>
            <tbody className="h-full">
                {students.map((student, index) => (
                    <tr key={student.id} className="[&_td]:border [&_td]:border-neutral-700 [&_td]:text-xs [&_td]:px-1">
                        <td className='text-center'>{index + 1}</td>
                        <td className='text-center'>{student.id}</td>
                        <td className='text-center'>{student.chineseName}</td>
                        <td className='text-center'>{student.englishName}</td>
                        <td className='text-center'>{student.class}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}

export const getServerSideProps: GetServerSideProps<PropsString> = async ({ res, req, query }) => {
    //get transactions within range
    const studentsSnapshot = await adminDb
        .collection('students')
        .where('status', '==', 'enrolled')
        .orderBy('studentid', 'asc')
        .withConverter<StudentDetails>(adminConverter)
        .get();

    const students = await studentsSnapshot.docs.map(doc => doc.data());
    
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
    const returnprop: Props = {
        students
    }

    return {
        props: {
            stringified: superjson.stringify(returnprop)
        }
    };
}

export default NameListExport;