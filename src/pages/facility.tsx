import { Collapse } from "@mui/material";
import { collection, DocumentReference, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import AddFacilityOrder from "../components/AddFacilityOrder";
import FacilityOrder from "../components/FacilityOrder";
import MemberLayout from "../components/MemberLayout"
import Page from "../components/Page"
import { db, docConverter } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import useToggle from "../hooks/useToggle";
import { FacilityOrderData } from "../types/Facility";
import AddRounded from "@mui/icons-material/AddRounded";

const Facility = () => {
    const { user, userToken } = useAuth();
    const [openForm, setOpenForm] = useToggle();
    const [orders = [], loading, error] = useCollectionData<FacilityOrderData & { ref: DocumentReference }>(userToken?query(collection(db, 'fab_orders'), where('requestedBy.studentid', '==', userToken?.studentid)).withConverter(docConverter): undefined);
    // console.log(orders)
    return <MemberLayout>
        <Page title="Facility">
            <div className="rounded-lg shadow-lg p-4">
                <Collapse in={!openForm}>
                    <h1 className="text-lg font-medium cursor-pointer" onClick={setOpenForm}>
                        <AddRounded/>
                        Add Order
                    </h1>
                </Collapse>
                <Collapse in={openForm}>
                    <AddFacilityOrder />
                </Collapse>
            </div>
            <div className="flex flex-col mt-2 space-y-2">
                {orders.map(order => <FacilityOrder key={order.id} order={order} isCurrentUser />)}
            </div>
        </Page>
    </MemberLayout>
}

export default Facility;