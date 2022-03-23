import { collection, DocumentReference, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import AddFacility from "../components/AddFacility";
import FacilityOrder from "../components/FacilityOrder";
import MemberLayout from "../components/MemberLayout"
import Page from "../components/Page"
import { db, docConverter } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { FacilityOrderData } from "../types/Facility";

const Facility = () => {
    const { user, userToken } = useAuth();
    const [orders = [], loading, error] = useCollectionData<FacilityOrderData & { ref: DocumentReference }>(userToken?query(collection(db, 'fab_orders'), where('requestedBy.studentid', '==', userToken?.studentid)).withConverter(docConverter): undefined);
    console.log(orders)
    return <MemberLayout>
        <Page title="Facility">
            <AddFacility />
            <div className="flex flex-col mt-2 space-y-2">
                {orders.map(order => <FacilityOrder key={order.id} order={order} isCurrentUser />)}
            </div>
        </Page>
    </MemberLayout>
}

export default Facility;