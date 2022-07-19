import { formatInTimeZone } from 'date-fns-tz'
import { Timestamp as ServerTimestamp } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { adminConverter, adminDb } from "../../config/firebase-admin";
import { useAuth } from "../../hooks/useAuth";
import superjson from 'superjson';
import { endOfMonth, isMatch, parse } from 'date-fns';
import { Transaction } from '../../types/Finance';
import InventoryItem from '../../types/Inventory';

type Props = {
    inventory: InventoryItem[]
}

type PropsString = { stringified?: string, error?: string }

const InventoryReport: NextPage<PropsString> = ({ stringified, error }) => {
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
    const { inventory } = superjson.parse<Props>(stringified);

    console.log(inventory);


    return <div className="min-h-[21cm] w-[29.7cm] flex flex-col px-8 pt-4  overflow-x-hidden">
        <div className="grid grid-cols-[12rem_auto_12rem] pb-8">
            <img src="/cec-logo-gradient-black.png" className="w-28" />
            <div className="text-center">
                <h1 className="text-xl font-semibold text-black">Inventory Record</h1>
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
                <tr className="[&_td]:border [&_td]:border-neutral-700 [&_td]:text-sm [&_td]:text-center [&_td]:px-1 [&_td]:font-semibold [&_td]:whitespace-nowrap">
                    <td>#</td>
                    <td>Simple ID</td>
                    <td>Description</td>
                    <td>Qty</td>
                    <td>Status</td>
                    <td>Registerer</td>
                    <td>Date Registered</td>
                    <td>Remarks</td>
                </tr>
            </thead>
            <tbody className="h-full">
                {inventory.map((item, index) => (
                    <tr key={item.id} className="[&_td]:border [&_td]:border-neutral-700 [&_td]:text-xs [&_td]:px-1">
                        <td className='text-center'>{index + 1}</td>
                        <td>{item.simpleId}</td>
                        <td>{item.description}</td>
                        <td className='text-center'>{item.quantity}</td>
                        <td className='text-center capitalize'>{item.status}</td>
                        <td className='whitespace-nowrap'>{item.registeredBy.englishName} {item.registeredBy.studentid}</td>
                        <td className='text-center'>{formatInTimeZone(item.dateRegistered.toDate(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd')}</td>
                        <td>{item.metadata.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}

export const getServerSideProps: GetServerSideProps<PropsString> = async ({ res, req, query }) => {
    //get transactions within range
    const inventorySnapshot = await adminDb
        .collection('inventory')
        .where('type','==', 'item')
        .orderBy('description', 'asc')
        .withConverter<InventoryItem>(adminConverter)
        .get();

    const inventory = await inventorySnapshot.docs.map(doc => doc.data());
    
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
        inventory
    }

    return {
        props: {
            stringified: superjson.stringify(returnprop)
        }
    };
}

export default InventoryReport;