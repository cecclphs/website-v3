import { doc, DocumentReference } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, docConverter } from "../config/firebase";


type InventoryItem = {
    id: string,
    name: string,
    parent: string,
    child: string,
    metadata: {
        donatedBy: string,
        donatedOn: string,
    }
}

const InventoryItem = ({ itemId }: {itemId: string}) => {
    const [value, loading, error, snapshot] = useDocumentData<InventoryItem & {id: string, ref: DocumentReference}>(doc(db, 'inventory', itemId || "").withConverter<any>(docConverter))
    const { 
        id,
        name,
        parent,
        child,
        metadata: {
            donatedBy,
            donatedOn,
        }
    } = value || {} as InventoryItem;
    return <div className="flex flex-col rounded-lg shadow-lg z-20 p-3">
        <span className="text-sm text-gray-400">Item {id}</span>
        <h1 className="text-3xl font-bold py-4">{name}</h1>
    </div>
}

export default InventoryItem;