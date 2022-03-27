import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { FinanceAccountType } from "../types/Finance";

const FinanceAccountType = ({ account, accountId }: { account?: FinanceAccountType, accountId?: string }) => {
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
        <div className="flex flex-col justify-between p-3">
            <h4>{accountData?.accountName}</h4>
            <span className="text-2xl">{accountData?.balance}</span>
        </div>
    </div>
}

export default FinanceAccountType;