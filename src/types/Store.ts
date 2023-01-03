import {Timestamp, DocumentReference} from 'firebase/firestore';
import InventoryItem from "./Inventory"
import { ShortStudentInfo } from "./User"

export type StoreCartItem = {
    quantity: number,
    item: InventoryItem,
}

export type StoreTransaction = {
    id: string,
    ref: DocumentReference;
    amount: number,
    cart: StoreCartItem[],
    paymentMethod: string,
    purchaser: ShortStudentInfo,
    registerer: ShortStudentInfo,
    timestamp: Timestamp,
    total: number,
}
