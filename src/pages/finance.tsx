import { collection, orderBy, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MemberLayout from "../components/MemberLayout";
import NewTransaction from "../components/NewTransaction";
import Page from "../components/Page";
import { db, docConverter } from "../config/firebase";
import { FinanceAccountType, Transaction } from "../types/Finance";
import FinanceAccount from "../components/FinanceAccount";
import { formatDistance, formatDistanceToNow, subDays } from "date-fns";
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

const Finance = () => {
    const [transactions = [], loading, error] = useCollectionData<Transaction>(query(collection(db, 'transactions'), orderBy('date', 'desc')).withConverter(docConverter));
    const [accounts = [], loadingAccounts, errorAccounts] = useCollectionData<FinanceAccountType>(collection(db, 'accounts').withConverter(docConverter));
    console.log(transactions)

    const getAccountName = (id: string) => {
        const account = accounts.find(account => account.id === id);
        return account?.accountName || "";
    }

    return <MemberLayout>
        <Page title="Financials">
            <NewTransaction/>
            <div className="flex flex-row space-x-2">
                {accounts.map(account => (<FinanceAccount key={account.id} account={account} />))}
            </div>
            <table className="w-full">
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
                {transactions.map(transaction => (
                    <tr className="hover:bg-gray-100">
                        <td className='text-sm font-semibold'>{transaction.registeredBy.studentid}</td>
                        <td className="text-center">{formatDistanceToNow(transaction.date.toDate(), { addSuffix: true })}</td>
                        <td>{transaction.description}</td>
                        <td className="text-center">{transaction.type == 'transfer'?`${getAccountName(transaction.account)} -> ${getAccountName(transaction.toAccount)}`:getAccountName(transaction.account)}</td>
                        <td className="text-right flex justify-between">
                            <span>RM</span>
                            <span>{transaction.amount}</span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Page>
    </MemberLayout>
}

export default Finance;