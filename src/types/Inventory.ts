import { DocumentReference, Timestamp } from 'firebase/firestore'
import {ShortStudentInfo} from './User';

export default interface InventoryItem {
    id: string
    ref: DocumentReference
    description: string
    parent: string | null
    children: number
    status: 'borrowed' | 'available' | 'lost'
    type: 'location' | 'container' | 'project' | 'item'
    simpleId: string | null
    quantity?: number
    metadata: {
        donatedBy?: string,
        donatedOn?: string,
        serialNumber?: string,
        model?: string,
        price?: number,
        brand?: string,
        purchase: {
            date?: string,
            supplier?: string,
            purchasedBy?: ShortStudentInfo
            financeRef?: string,
        },
        notes?: string,
        borrowedBy?: ShortStudentInfo
    }
    registeredBy: ShortStudentInfo
    dateRegistered: Timestamp,
}
