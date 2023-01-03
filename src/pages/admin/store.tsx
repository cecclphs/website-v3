import { collection, orderBy, query } from "firebase/firestore"
import { useCollectionData } from "react-firebase-hooks/firestore"
import MemberLayout from "../../components/MemberLayout"
import Page from "../../components/Page"
import { db, docConverter } from "../../config/firebase"
import { StoreTransaction } from "../../types/Store"
import { FC } from 'react';
import { NextPage } from "next/types"
import { format } from "date-fns"
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material"
import { ExpandMore } from "@mui/icons-material"

const TransactionItem: FC<{transaction: StoreTransaction }> = ({ transaction }) => {
    return <div className='flex flex-col space-y-1 py-2 px-1'>
        <h2 className='text-sm font-semibold text-gray-400'>Trx: #{transaction.id}</h2>
        <h2 className='text-lg font-semibold'>{format(transaction.timestamp.toDate(), "yyyy/MM/dd hh:MM:ss")}</h2>
        <h2>{transaction.purchaser.englishName} - {transaction.purchaser.studentid}</h2>
        <h2 className='text-lg font-semibold'>Total: RM {transaction.total.toFixed(2)}</h2>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                id="panel1a-header"
            >
                <Typography>Cart Items</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {transaction.cart.map((item) => (
                    <div className='flex flex-row justify-between space-x-1' key={item.item.id}>
                        <h2 className='text-sm font-semibold'>{item.item.description}</h2>
                        <h2 className='text-sm font-semibold'>
                            <span>RM {item.item.metadata.price.toFixed(2)}</span>
                            <span>x{item.quantity}</span>
                            <span>=RM {(item.item.metadata.price * item.quantity).toFixed(2)}</span>
                        </h2>
                    </div>
                ))}
            </AccordionDetails>
        </Accordion>
    </div>
}

const StoreManagement: NextPage = () => {
    const [transactions = [], loading, error] = useCollectionData<StoreTransaction>(query(collection(db, 'store', 'CEC', 'transactions').withConverter(docConverter), orderBy('timestamp', 'desc')));

    return <MemberLayout>
        <Page title="Past Transactions">
            <div className="flex flex-col space-y-3">
                <div className="flex flex-col divide-y divide-gray-400">
                {transactions.map((trans) => (
                    <TransactionItem key={trans.id} transaction={trans} />
                ))}
                </div>
            </div>
        </Page>
    </MemberLayout>
}

export default StoreManagement;