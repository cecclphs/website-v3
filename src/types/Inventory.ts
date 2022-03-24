import { Timestamp } from 'firebase/firestore'

export default interface InventoryItem {
    id: string
    description: string
    parent: string | null
    children: string[]
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
            purchasedBy?: {
                studentid: string,
                englishName: string,
            }
            financeRef?: string,
        },
        notes?: string,
        borrowedBy?: {
            studentid: string,
            englishName: string,
        }
    }
    registeredBy: {
        studentid: string,
        englishName: string,
    }
    dateRegistered: Timestamp,
}
