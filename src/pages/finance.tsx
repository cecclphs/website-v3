import { collection, orderBy, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MemberLayout from "../components/MemberLayout";
import NewTransaction from "../components/NewTransaction";
import Page from "../components/Page";
import { db, docConverter } from "../config/firebase";
import { FinanceAccountType, Transaction } from "../types/Finance";
import FinanceAccount from "../components/FinanceAccount";
import { format, formatDistance, formatDistanceToNow, subDays } from "date-fns";
import { Chip, Tooltip } from "@mui/material";
import { NoteRounded, ReceiptRounded } from "@mui/icons-material";
import { useMemo } from "react";
import AddAccount from "../components/AddAccount";

const Finance = () => {
    const [transactions = [], loading, error] = useCollectionData<Transaction>(query(collection(db, 'transactions'), orderBy('date', 'desc')).withConverter(docConverter));
    const [accounts = [], loadingAccounts, errorAccounts] = useCollectionData<FinanceAccountType>(collection(db, 'accounts').withConverter(docConverter));
    console.log(transactions)

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income':
                return 'bg-green-50';
            case 'expense':
                return 'bg-red-100';
            case 'transfer':
                return 'bg-blue-100';
        }
    }

    const addNumbersFixed = (num1, num2) => {
        console.log(num1, num2)
        return +(num1 + num2).toFixed(2);
    }

    const accountsSum = useMemo(() => {
        return accounts.reduce((sum, account) => {
            return addNumbersFixed(sum, account.balance);
        }, 0);
    }, [accounts]);

    const getColor = (transaction) => {
        // pending: 'bg-orange-300',
        // income: 'bg-green-300',
        // expense: 'bg-red-300',
        // error: 'bg-red-800 text-red-100'
        switch (transaction.status) {
            case 'pending':
                return getTypeColor(transaction.type) + ' text-gray-700';
            case 'successful':
                return getTypeColor(transaction.type)
            case 'error':
                return 'bg-red-800 text-red-100';
        }
    }

    const getAccountName = (id: string) => {
        const account = accounts.find(account => account.id === id);
        return account?.accountName || "";
    }

    return <MemberLayout>
        <Page title="Financials">
            <NewTransaction/>
            <h2 className="text-2xl font-semibold py-1">Accounts</h2>
            <div className="flex flex-row space-x-2">
                <FinanceAccount account={{id: 'all', accountName: 'All', balance: accountsSum, type: "bank"}}/>
                {accounts.map(account => (<FinanceAccount key={account.id} account={account} />))}
                <AddAccount />
            </div>
            <table className="w-full border-collapse mt-2 border-t border-solid border-gray-300">
                <thead>
                    <tr>
                        <th className="p-1"></th>
                        <th className="text-left p-1">Date</th>
                        <th className="text-left p-1">Description</th>
                        <th className="p-1"></th>
                        <th className="p-1">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-solid divide-gray-200">
                {transactions.map(transaction => (
                    <tr className={`${getColor(transaction)} hover:opacity-80 transition cursor-pointer`} key={transaction.id}>
                        <td className="text-center p-2">{transaction.type == 'transfer'?`${getAccountName(transaction.account)} -> ${getAccountName(transaction.toAccount)}`:getAccountName(transaction.account)}</td>
                        <td className="p-2">{
                            format(transaction.date.toDate(), "yyyy-MM-dd")}
                        </td>
                        <td>{transaction.description}</td>
                        <td className='text-sm font-semibold p-2'>
                            {<Tooltip title="Receipts">
                                <Chip icon={<ReceiptRounded />} label={transaction.invoices?.length || 0} size="small"/>
                            </Tooltip>}
                            {transaction?.remarks && <Tooltip title="Notes"><Chip icon={<NoteRounded />} label={1}  size="small"/></Tooltip>}
                        </td>
                        <td className="text-right flex justify-between p-2 align-bottom">
                            <span className="text-gray-700">RM</span>
                            <span>{transaction.type == 'expense'?'-':''}{transaction.amount.toFixed(2)}</span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Page>
    </MemberLayout>
}

export default Finance;