import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz'
import { Timestamp as ServerTimestamp } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { adminConverter, adminDb } from "../../config/firebase-admin";
import { useAuth } from "../../hooks/useAuth";
import superjson from 'superjson';
import { addDays, endOfMonth, format, getMonth, getYear, isAfter, isMatch, lastDayOfMonth, parse, parseISO, startOfMonth } from 'date-fns';
import { Transaction } from '../../types/Finance';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import {addNumbersFixed} from '../../utils/numbers';

type SerializedProps = { stringified?: string, error?: string }

type PropType = {
    transactions: Transaction[];
    startAmount: number;
    endAmount: number;
}

const PrintFinance: NextPage<SerializedProps> = ({ stringified, error }) => {
    const { user, userDetails } = useAuth();
    const router = useRouter();
    const { month } = router.query;
    const date = parse(month as string, 'yyyy-MM', new Date(2022, 1, 1, 8, 0, 0, 0));

    if(error) return <div className='h-screen w-screen grid place-items-center text-2xl'>{error}</div>;

    superjson.registerCustom<Timestamp, string>(
        {
            isApplicable: (value): value is Timestamp => value instanceof Timestamp,
            serialize: (value) => value.toDate().toISOString(),
            deserialize: (value) => Timestamp.fromDate(parseISO(value)),
        },
        'firebase-admin/firestore'
    )
    const parsed = superjson.parse<PropType>(stringified);
    const { transactions, startAmount, endAmount } = parsed;
    console.log(parsed)
    const expenses = useMemo(() => {
        return transactions.filter(t => t.type === 'expense')
    }, [transactions]);
    const incomes = useMemo(() => {
        return transactions.filter(t => t.type === 'income')
    }, [transactions]);

    const expensetotal = expenses.reduce((acc, cur) => addNumbersFixed(acc, cur.amount), 0);
    const incometotal = incomes.reduce((acc, cur) => addNumbersFixed(acc, cur.amount), 0);
    const incomeaudit =  addNumbersFixed(startAmount, incometotal);
    const balcd = addNumbersFixed(incomeaudit, -expensetotal);
    const expenseaudit = addNumbersFixed(balcd, expensetotal);

    console.log(expensetotal)

    return <div className="min-h-[29.7cm] w-[21cm] flex flex-col p-[0.5in]  overflow-x-hidden font-[KaiTi]">
        <div className="grid grid-cols-[12rem_auto_12rem] border-2 border-neutral-700">
            <div className='grid place-items-center'>
                <img src="/cec-logo-gradient-black.png" className="h-16" />
            </div>
            <div className="text-center">
                <p>{getYear(date)}年 锺灵独立中学</p>
                <p>电子创意学会</p> 
                <p>{format(date, 'M')}月份财政报告</p>
            </div>
            <div className='grid place-items-center'>
                <img src="/clphs.png" className="h-16" />
            </div>
        </div>
        <div className="grid grid-cols-2 min-h-[40vh]">
            <table className="border-collapse border-l-2 border-b-2 border-neutral-700 h-full table-fixed">
                <thead className="break-inside-avoid">
                    <td className='border-2 border-neutral-700'>日期</td>
                    <td className='border-2 border-neutral-700'>收入</td>
                    <td className='border-2 border-neutral-700'>RM</td>
                </thead>
                <tbody className="h-full">
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'>{getYear(date)}</td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                    </tr>
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'>{formatInTimeZone(startOfMonth(date), 'Asia/Kuala_Lumpur', 'M月d日')}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>Balance b/d</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{startAmount.toFixed(2)}</td>
                    </tr>
                    {incomes.map(t => <tr key={t.id}>
                        <td className='h-6 border-x-2 border-neutral-700'>{formatInTimeZone(t.date.toDate(), 'Asia/Kuala_Lumpur', 'M月d日')}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{t.description}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{t.amount.toFixed(2)}</td>
                    </tr>)}
                    <tr>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-2 border-neutral-700'>{incomeaudit.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className='border-x-2 border-neutral-700'>{getYear(addDays(lastDayOfMonth(date), 1))}</td>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                    </tr> 
                    <tr>
                        <td className='border-x-2 border-neutral-700'>{formatInTimeZone(addDays(lastDayOfMonth(date), 1), 'Asia/Kuala_Lumpur', 'M月d日')}</td>
                        <td className='border-x-2 border-neutral-700'>Balance b/d</td>
                        <td className='border-x-2 border-neutral-700'>{endAmount.toFixed(2)}</td>
                    </tr> 
                </tfoot>
            </table>
            <table className="border-collapse border-x-2 border-b-2 border-neutral-700 h-full table-fixed">
                <thead className="break-inside-avoid">
                    <td className='border-2 border-neutral-700'>日期</td>
                    <td className='border-2 border-neutral-700'>支出</td>
                    <td className='border-2 border-neutral-700'>RM</td>
                </thead>
                <tbody className="h-full">
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                    </tr>
                    {expenses.map(t => <tr key={t.id}>
                        <td className='h-6 border-x-2 border-neutral-700'>{formatInTimeZone(t.date.toDate(), 'Asia/Kuala_Lumpur', 'M月d日')}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{t.description}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{t.amount.toFixed(2)}</td>
                    </tr>)}
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'>{formatInTimeZone(lastDayOfMonth(date), 'Asia/Kuala_Lumpur', 'M月d日')}</td>
                        <td className='h-6 border-x-2 border-neutral-700'>Balance c/d</td>
                        <td className='h-6 border-x-2 border-neutral-700'>{balcd.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                        <td className='border-x-2 border-neutral-700'></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-2 border-neutral-700'>{expenseaudit.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                    </tr> 
                    <tr>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                        <td className='h-6 border-x-2 border-neutral-700'></td>
                    </tr> 
                </tfoot>
            </table>
        </div>
        <div className='grid grid-cols-3 gap-10 pt-12'>
            <div className='flex flex-col items-center'>
                <p>财政</p>
                <div className="border-b-2 border-black pt-24 w-full"></div>
                <p>杨善喆</p>
            </div>
            <div className='flex flex-col items-center'>
                <p>顾问老师</p>
                <div className="border-b-2 border-black pt-24 w-full"></div>
                <p>翁超瑀师</p>
            </div>
            <div className='flex flex-col items-center'>
                <p>主席</p>
                <div className="border-b-2 border-black pt-24 w-full"></div>
                <p>庄俊阳</p>
            </div>
        </div>
    </div>
}

// export const getServerSideProps: GetServerSideProps = async ({ res, req, query }) => { 
//     return {
//         props: {
//             stringified: (await readFile('attendance.json')).toString()
//         }
//     };
// }

export const getServerSideProps: GetServerSideProps<SerializedProps> = async ({ res, req, query }) => {
    const { month } = query;
    //return if record is array
    if (Array.isArray(month)) return { props: { error: 'Invalid month' } };
    //month should eg 2022-05   
    //get dates of first and last day
    if(!isMatch(month, 'yyyy-MM')) return { props: { error: 'invalid month' } }
    console.log('month', month);
    const firstDay = parse(`${month}-01`, 'yyyy-MM-dd', new Date(0));
    const lastDay = endOfMonth(firstDay);

    console.log('first', firstDay);
    console.log('last', lastDay);

    //if month is in the future, return error
    if (isAfter(lastDay, new Date())) return { props: { error: 'sadly we can\'t predict the future' } };
    
    //get transactions within range
    const transactionsSnapshot = await adminDb
        .collection('finance')
        .doc('CEC')
        .collection('transactions')
        .where('date', '>=', firstDay)
        .where('date', '<=', lastDay)
        .orderBy('date', 'asc')
        .withConverter<Transaction>(adminConverter)
        .get();

    const transactions = await transactionsSnapshot.docs.map(doc => doc.data());
    let startAmount: number, endAmount: number;
    //get all transactions after this date
    const startAmountSnapshot = await adminDb
        .collection('finance')
        .doc('CEC')
        .collection('transactions')
        .where('date', '>=', lastDay)
        .orderBy('date', 'asc')
        .withConverter<Transaction>(adminConverter)
        .get();
    const startAmounts = await startAmountSnapshot.docs.map(doc => doc.data());
    //calculate total amount
    const totalspentaftermonth = startAmounts.reduce((acc, cur) => {
        if (cur.type === 'expense') {
            return addNumbersFixed(acc, -cur.amount);
        } else if (cur.type === 'income') {
            return addNumbersFixed(acc, cur.amount);
        }
        return acc;
    }, 0);
    //get latest account balance
    const cecbankSnapshot = await adminDb
        .collection('finance')
        .doc('CEC')
        .get()
    const { balance } = cecbankSnapshot.data();
    //backtrack from balance and totalspentaftermonth
    endAmount = addNumbersFixed(balance, -totalspentaftermonth);
    //get start amount
    const totalTransactionSpend = transactions.reduce((acc, cur) => {
        if (cur.type === 'expense') {
            return addNumbersFixed(acc, -cur.amount);
        } else if (cur.type === 'income') {
            return addNumbersFixed(acc, cur.amount);
        }
        return acc;
    }, 0);
    startAmount = addNumbersFixed(addNumbersFixed(balance, -totalTransactionSpend), -totalspentaftermonth);
    
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )
    
    superjson.registerCustom<ServerTimestamp, string>(
        {
            isApplicable: (value): value is ServerTimestamp => value instanceof ServerTimestamp,
            serialize: (value) => value.toDate().toISOString(),
            deserialize: (value) => ServerTimestamp.fromDate(parseISO(value)),
        },
        'firebase-admin/firestore'
    )

    const returnProps: PropType = {
        transactions,
        startAmount,
        endAmount
    }


    return {
        props: {
            stringified: superjson.stringify(returnProps)
        }
    };
}

export default PrintFinance;