import { collection } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";

type Transaction = {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    date: Date;
}

const FinanceRow = ({transaction}: { transaction: Transaction }) => {
    const { id, type, amount, description, date } = transaction;
    return <tr>
        <td className='text-sm font-semibold py-2 w-[200px]'>{id}</td>
        <td>{type}</td>
        <td>{amount}</td>
        <td>{description}</td>
        <td>{date.toLocaleString()}</td>
    </tr>
}

const Financials = () => {
    const [transactions, loading, error] = useCollectionData(collection(db, 'transactions').withConverter(docConverter));
    console.log(transactions)
    return <MemberLayout>
        <Page title="Financials">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Date</th>
                        <th>Description</th>
                        <th></th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </Page>
    </MemberLayout>
}

export default Financials;