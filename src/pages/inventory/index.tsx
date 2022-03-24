import { Button } from "@mui/material";
import { collection, CollectionReference } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CreateInventoryItem from "../../components/CreateInventoryItem";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { db, docConverter } from "../../config/firebase";
import InventoryItem from "../../types/Inventory";

const Inventory = () => {
    const [inventory = [], loading, error] = useCollectionData((collection(db, 'inventory') as CollectionReference<InventoryItem>).withConverter(docConverter));
    return (
        <MemberLayout>
            <Page title="Inventory">
                <CreateInventoryItem/>
            </Page>
        </MemberLayout>
    )
}

export default Inventory;