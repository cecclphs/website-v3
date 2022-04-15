import { collection, orderBy, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MemberLayout from "../components/MemberLayout";
import NewTransaction from "../components/NewTransaction";
import Page from "../components/Page";
import { db, docConverter } from "../config/firebase";
import { FinanceAccountType, Transaction } from "../types/Finance";
import FinanceAccount from "../components/FinanceAccount";
import { format } from "date-fns";
import {Chip, Tooltip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, DialogContent, DialogActions, Button, DialogTitle} from '@mui/material';
import {NoteRounded, ReceiptRounded, Delete, MoreVertRounded} from '@mui/icons-material';
import { useMemo } from "react";
import AddAccount from "../components/AddAccount";
import {bindTrigger, bindMenu, usePopupState} from 'material-ui-popup-state/hooks';
import { useDialog } from "../hooks/useDialog";
import { fetchAPI } from "../utils/fetchAPI";
import { useAuth } from "../hooks/useAuth";
  
const TransactionLog = ({ transaction, accounts }) => {
    const { user } = useAuth();
    const [openDialog, closeDialog] = useDialog();
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

    const getColor = (transaction) => {
        switch (transaction.status) {
            case 'pending':
                return getTypeColor(transaction.type) + ' text-gray-400 animate-pulse';
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

    const handleConfirmRebaseDelete = () => {
        popupState.close();
        openDialog({
            children: <>
                <DialogTitle>
                    Are you sure you want to delete this transaction?
                </DialogTitle>
                <DialogContent>
                    <p className="text-red-700">* This will revert the account back to it's current balance forcefully and delete all the previous transactions. If this is not the intended action, DO NOT PROCEED.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button color="error" onClick={() => {
                        fetchAPI('/finance/purge', user, {
                            method: 'POST',
                            body: JSON.stringify({
                                transactionId: transaction.id
                            })
                        })
                    }}>Delete</Button>
                </DialogActions>
            </>
        })
    }


    const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })
    return <tr className={`${getColor(transaction)} hover:opacity-80 transition cursor-pointer`} key={transaction.id}>
        <td className="text-center p-2">{transaction.type == 'transfer'?`${getAccountName(transaction.account)} -> ${getAccountName(transaction.toAccount)}`:getAccountName(transaction.account)}</td>
        <td className="p-2">{
            format(transaction.date.toDate(), "yyyy-MM-dd")}
        </td>
        <td>{transaction.status == "pending"? "PENDING:":""} {transaction.description}</td>
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
        {/* <td className="w-min">
            <IconButton {...bindTrigger(popupState)}>
                <MoreVertRounded/>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={popupState.close}>View</MenuItem>
                <MenuItem onClick={handleConfirmRebaseDelete}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{"Rebase & Delete"}</ListItemText>
                </MenuItem>
            </Menu>
        </td> */}
    </tr>
}

const Finance = () => {
    const [transactions = [], loading, error] = useCollectionData<Transaction>(query(collection(db, 'finance', 'CEC', 'transactions'), orderBy('date', 'desc')).withConverter(docConverter));
    const [accounts = [], loadingAccounts, errorAccounts] = useCollectionData<FinanceAccountType>(collection(db, 'finance', 'CEC', 'accounts').withConverter(docConverter));
    console.log(transactions)

    const addNumbersFixed = (num1, num2) => {
        console.log(num1, num2)
        return +(num1 + num2).toFixed(2);
    }

    const accountsSum = useMemo(() => {
        return accounts.reduce((sum, account) => {
            return addNumbersFixed(sum, account.balance);
        }, 0);
    }, [accounts]);

    return <MemberLayout>
        <Page title="Financials">
            <NewTransaction/>
            <h2 className="text-2xl font-semibold py-1">Accounts</h2>
            <div className="flex flex-row space-x-2 overflow-x-auto w-full">
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
                {transactions.map(transaction => (<TransactionLog key={transaction.id} transaction={transaction} accounts={accounts}/>))}
                </tbody>
            </table>
        </Page>
    </MemberLayout>
}

export default Finance;