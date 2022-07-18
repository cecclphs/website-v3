import { formatInTimeZone } from 'date-fns-tz'
import { Timestamp as ServerTimestamp } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { adminConverter, adminDb } from "../../config/firebase-admin";
import { useAuth } from "../../hooks/useAuth";
import superjson from 'superjson';
import { endOfMonth, isMatch, parse } from 'date-fns';
import { Transaction } from '../../types/Finance';

const InventoryReport: NextPage<{ stringified: string }> = ({ stringified }) => {
    const { user, userDetails } = useAuth();
    superjson.registerCustom<Timestamp, string>(
        {
        isApplicable: (value): value is Timestamp => value instanceof Timestamp,
        serialize: (value) => value.toDate().toISOString(),
        deserialize: (value) => Timestamp.fromDate(new Date(value)),
        },
        'firebase-admin/firestore'
    )
    const { transactions } = superjson.parse<{ transactions: Transaction[] }>(stringified);

    console.log(transactions);


    return <div className="min-h-[29.7cm] w-[21cm] flex flex-col px-8 pt-4  overflow-x-hidden">
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
            </thead>
            <tbody className="h-full">
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
    const { month } = query;
    //return if record is array
    if (Array.isArray(month)) return { props: { stringified: 'Invalid month' } };
    //month should eg 2022-05
    //get dates of first and last day
    if(!isMatch('yyyy-MM', month)) return { props: { stringified: 'invalid month' } }
    const firstDay = parse('yyyy-MM-dd', `${month}-01`, new Date());
    const lastDay = endOfMonth(firstDay);
    
    //get transactions within range
    const transactionsSnapshot = await adminDb
        .collection('finance')
        .doc('CEC')
        .collection('transactions')
        .where('date', '>=', firstDay)
        .where('date', '<=', lastDay)
        .where('type','!=', 'transfer')
        .orderBy('date', 'asc')
        .withConverter<Transaction>(adminConverter)
        .get();

    const transactions = await transactionsSnapshot.docs.map(doc => doc.data());
    
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


    return {
        props: {
            stringified: superjson.stringify({
                transactions
            })
        }
    };
}

export default InventoryReport;