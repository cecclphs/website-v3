import { Timestamp } from 'firebase/firestore'

export default interface InventoryItem {
    id: string,
    name: string,
    parent: string,
    children: string[],
    simpleId: string;
    metadata?: {
        donatedBy?: string,
        donatedOn?: string,
        serialNumber?: string,
        model?: string,
        price?: number,
        purchasedOn?: string,
        purchasedFrom?: string,
        purchasedBy?: {
            studentid: string,
            englishName: string,
        },
    },
    registeredBy: {
        studentid: string,
        englishName: string,
    }
    dateRegistered: Timestamp,
}
