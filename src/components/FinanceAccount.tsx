import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { FinanceAccountType } from "../types/Finance";
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';
import { MoneyTwoTone } from "@mui/icons-material";

const FinanceAccount = ({ account, accountId }: { account?: FinanceAccountType, accountId?: string }) => {
    const [accountData, setAccountData] = useState<FinanceAccountType>();
    useEffect(() => {
        if(!accountId) return;
        return onSnapshot(doc(db, `accounts/${accountId}`), (snapshot) => {
            if(snapshot.exists) {
                setAccountData(snapshot.data() as FinanceAccountType);
            }
        })
    },[accountId])

    useEffect(() => {
        if(!account) return;
        setAccountData(account);
    },[account])

    return <div className="flex flex-col rounded-md border border-solid border-gray-300">
        <div className="flex flex-col justify-between p-3 space-y-1">
            <h4>{accountData?.type == 'bank'? <AccountBalanceTwoToneIcon/>: <MoneyTwoTone/>} {accountData?.accountName}</h4>
            <p>{accountData?.notes}</p>
            <span className="text-2xl"><span className="text-lg">RM</span> {accountData?.balance?.toFixed(2)}</span>
        </div>
    </div>
}

export default FinanceAccount;