import { FacilityOrderData } from "../types/Facility";

const FacilityOrder = ({ order }: {order: FacilityOrderData }) => {
    const {
        id,
        title,
        facility,
        instructions,
        selfFab,
        file,
        status,
        createdAt,
        updatedAt,
        requestedBy
    } = order;
    
    return <div className="rounded-lg shadow-lg overflow-hidden flex flex-row">
        <div className="h-full w-2 bg-green-500"></div>
        <div className="flex-1 h-full">
            <h3>{requestedBy?.englishName} {requestedBy?.studentid}</h3>
            <h2>{title}</h2>
        </div>
    </div>
}

export default FacilityOrder;