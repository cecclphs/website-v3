import { collection, DocumentReference, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import FacilityOrder from "../../components/FacilityOrder";
import MemberLayout from "../../components/MemberLayout"
import Page from "../../components/Page"
import { db, docConverter } from "../../config/firebase";
import { useAuth } from "../../hooks/useAuth";
import { FacilityOrderData } from "../../types/Facility";

const Fabrication = () => {
    const { user, userToken } = useAuth();
    const [orders = [], loading, error] = useCollectionData<FacilityOrderData & { ref: DocumentReference }>(userToken?query(collection(db, 'fab_orders')).withConverter(docConverter): undefined);

    return (
        <MemberLayout>
            <Page title="Fabrication">
                <div className="flex flex-col mt-2 space-y-2">
                    {orders.map(order => <FacilityOrder key={order.id} order={order} />)}
                </div>
            </Page>
        </MemberLayout>
    )
}

export default Fabrication;