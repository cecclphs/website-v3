import { Button } from "@mui/material";
import CreateInventoryItem from "../../components/CreateInventoryItem";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";

const Inventory = () => {
    return (
        <MemberLayout>
            <Page title="Inventory">
                <CreateInventoryItem/>
            </Page>
        </MemberLayout>
    )
}

export default Inventory;