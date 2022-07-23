import { useRouter } from "next/router";
import CreateInventoryItem from "../components/CreateInventoryItem";
import InventoryLocator from "../components/InventoryLocator";
import InventoryTree from "../components/InventoryTree";
import MemberLayout from "../components/MemberLayout";
import Page from "../components/Page";
const Inventory = () => {
    const router = useRouter();
    const parent = router.query.parent || null;
    return (
        <MemberLayout>
            <Page title="Inventory">
                <CreateInventoryItem parent={parent as string}/>
                <InventoryLocator />
                <InventoryTree parent={parent as string}/>
            </Page>
        </MemberLayout>
    )
}


export default Inventory;