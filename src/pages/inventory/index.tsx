import CreateInventoryItem from "../../components/CreateInventoryItem";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import InventoryTree from "../../components/InventoryTree";

const Inventory = () => {
    return (
        <MemberLayout>
            <Page title="Inventory">
                <CreateInventoryItem/>
                <InventoryTree parent={null}/>
            </Page>
        </MemberLayout>
    )
}

export default Inventory;