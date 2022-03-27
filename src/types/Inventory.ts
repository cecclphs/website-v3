import { Timestamp } from 'firebase/firestore'
import {StudentDetails} from './User';

export default interface InventoryItem {
    id: string
    description: string
    parent: string | null
    children: number
    status: 'borrowed' | 'available' | 'lost'
    type: 'location' | 'container' | 'project' | 'item'
    simpleId: string | null
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
            purchasedBy?: StudentDetails
            financeRef?: string,
        },
        notes?: string,
        borrowedBy?: StudentDetails
    }
    registeredBy: StudentDetails
    dateRegistered: Timestamp,
}
