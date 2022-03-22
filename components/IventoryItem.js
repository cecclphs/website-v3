import { useDocumentData } from "react-firebase-hooks/firestore";
import { docConverter } from "../config/firebase";

const InventoryItem = ({ itemId }) => {
    const [{ 
        id,
        name,
        parent,
        child,
        metadata: {
            donatedBy,
            donatedOn,
        }
     }, loading, error, snapshot] = useDocumentData(doc(db, 'inventory', itemId || "").withConverter(docConverter))

    return <div className="flex flex-col rounded-lg shadow-lg z-20 p-3">
        <span classNam="text-sm text-gray-400">Item {id}</span>
        <h1 className="text-3xl font-bold py-4">{name}</h1>
    </div>
}

export default InventoryItem;