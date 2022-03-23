import { FacilityOrderData } from "../types/Facility";
import { useAuth } from "../hooks/useAuth";
import { useMemo } from "react";
import { Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useDialog } from "../hooks/useDialog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
const FacilityOrder = ({ order, isCurrentUser=false }: {order: FacilityOrderData, isCurrentUser?: boolean }) => {
    const {
        id,
        title,
        facility,
        instructions,
        selfFab,
        files,
        status,
        createdAt,
        updatedAt,
        price,
        requestedBy
    } = order;

    const { userToken } =  useAuth();
    const [openDialog, closeDialog] = useDialog();
    const cancellable = useMemo(() => (status === 'pending' || status === 'accepted') && isCurrentUser, [status, isCurrentUser]);
    const handleCancel = () => {
        if(!userToken) return;
        openDialog({
            children: <>
                <DialogTitle>Cancelling Order</DialogTitle>
                <DialogContent>Are you sure?</DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={closeDialog}>Cancel</Button>
                    <Button color="error" onClick={() => {
                        updateDoc(doc(db, `fab_orders/${id}`), { status: 'cancelled' });
                        closeDialog();
                    }}>Yes</Button>
                </DialogActions>
            </>
        })
    }
    const statusColor = () => {
        switch(status) {
            case 'pending': return 'bg-gray-500';
            case 'accepted': return 'bg-blue-500';
            case 'rejected': return 'bg-black-500';
            case 'cancelled': return 'bg-red-500';
            case 'fabricating': return 'bg-orange-500';
            case 'completed': return 'bg-green-500';
        }
    }

    const statusText = () => {
        switch(status) {
            case 'pending': return 'Pending';
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
            case 'cancelled': return 'Cancelled';
            case 'fabricating': return 'Fabricating';
            case 'completed': return 'Completed';
        }
    }

    const facilityText = () => {
        switch(facility) {
            case '3dprinter': return '3D Printer';
            case 'lasercutter': return 'Laser Cutter';
        }
    }
    
    return <div className="rounded-lg shadow-md overflow-hidden flex flex-row hover:shadow-lg transition">
        <div className={`w-2 ${statusColor()}`}></div>
        <div className="flex-1 p-3 flex flex-row">
            <div className="flex-1">
                <h2 className="font-semibold text-sm text-gray-500">#{id}</h2>
                {!isCurrentUser && <h3 className="font-bold text-lg">{requestedBy?.englishName} {requestedBy?.studentid}</h3>}
                <h2 className="font-bold text-lg">{title}</h2>
                <h2 className="font-bold text-lg">{facilityText()}</h2>
                <p>{instructions || "No instructions"}</p>
                {price && <h2 className="font-bold text-lg">RM {price.toFixed(2)}</h2>}
                <h2 className="font-bold text-lg">{statusText()}</h2>
            </div>  
            <div className="flex flex-col">
                <Button variant="outlined">
                    Download Files
                </Button>
                <Button color="error" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    </div>
}

export default FacilityOrder;