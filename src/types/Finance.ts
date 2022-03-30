import { DocumentReference, Timestamp } from "firebase/firestore";
import {ShortStudentInfo} from './User';

export type Transaction = {
    id: string;
    ref: DocumentReference;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    date: Timestamp;
    status: 'pending' | 'successful' | 'failed';
    invoices : {url: string, caption?: string }[],
    account: string,
    toAccount: string,
    remarks?: string;
    registeredBy: ShortStudentInfo;
    metadata?: {
        [x: string]: any;
    }
}

export type FinanceAccountType = {
    id: string;
    ref: DocumentReference;
    accountName: string;
    balance: number;
    type: 'cash' | 'bank';
    notes?: string;
    metadata?: {
        [x: string]: any;
    },
    lastTransactionAt?: Timestamp;
}