import { Timestamp } from "firebase/firestore";

export type Transaction = {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    date: Timestamp;
    status: 'pending' | 'successful' | 'failed';
    invoices : {url: string, caption?: string }[]
    remarks?: string;
    metadata?: {
        [x: string]: any;
    }
}

export type FinanceAccount = {
    id: string;
    accountName: string;
    amount: number;
    type: 'cash' | 'bank';
    notes?: string;
    metadata?: {
        [x: string]: any;
    }
}