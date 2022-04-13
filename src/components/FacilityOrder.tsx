import { FacilityOrderData } from "../types/Facility";
import { useAuth } from "../hooks/useAuth";
import { useMemo } from "react";
import { Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useDialog } from "../hooks/useDialog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import FileOpenTwoTone from "@mui/icons-material/FileOpenTwoTone";

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

    const { userToken, userDetails } =  useAuth();
    const [openDialog, closeDialog] = useDialog();
    
    const setStatus = (status: FacilityOrderData['status']) => updateDoc(doc(db, `fab_orders/${id}`), { status });

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
                        setStatus('cancelled')
                        closeDialog();
                    }}>Yes</Button>
                </DialogActions>
            </>
        })
    }

    const handleChecked = (status: 'accepted'| 'rejected') => {
        if(!userToken) return;
        updateDoc(doc(db, `fab_orders/${id}`), { 
            status,
            checkedBy: {
                englishName: userDetails.englishName,
                studentid: userToken.studentid
            }
        })
    }

    const handleDownload = () => {
        if(!userToken) return;
        openDialog({
            children: <>
                <DialogTitle>Download Fab Files</DialogTitle>
                <DialogContent>
                    {files.map(({filename, url}) => 
                    <a href={url} key={filename} target="_blank" download={filename} type="application/octet-stream" >
                        <div className="flex flex-row justify-start space-x-2 items-center w-full py-2">
                            <FileOpenTwoTone className="w-5 h-5 text-blue-800 opacity-80"/>
                            <div className="text-ellipsis overflow-hidden whitespace-nowrap text-gray-600">{filename}</div>
                        </div>
                    </a>)}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={closeDialog}>Done</Button>
                </DialogActions>
            </>
        })
    }

    const statusColor = () => {
        switch(status) {
            case 'pending': return 'bg-gray-500';
            case 'accepted': return 'bg-blue-500';
            case 'rejected': return 'bg-black';
            case 'cancelled': return 'bg-red-500';
            case 'fabricating': return 'bg-orange-500';
            case 'completed': return 'bg-green-500';
            case 'paid': return 'bg-green-800';
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
            case 'paid': return 'Paid';
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
            <div className="flex flex-col space-y-1">
                <Button variant="outlined" onClick={handleDownload}>
                    Download Files
                </Button>
                {!isCurrentUser && status == "pending" && <div className="flex flex-row space-x-1">
                    <Button className="flex-1" variant="outlined" color="success" onClick={() => handleChecked('accepted')}>
                        Accept
                    </Button>
                    <Button className="flex-1" variant="outlined" color="error" onClick={() => handleChecked('rejected')}>
                        Reject
                    </Button>
                </div>}
                {!isCurrentUser && status == "accepted" && 
                    <Button variant="outlined" color="warning" onClick={() => setStatus('fabricating')}>
                        Fabricate
                    </Button>}
                {!isCurrentUser && status == "fabricating" && 
                    <Button variant="outlined" color="success" onClick={() => setStatus('completed')}>
                        Complete
                    </Button>}
                {!isCurrentUser && status == "completed" && 
                    <Button variant="outlined" color="primary" onClick={() => setStatus('paid')}>
                        Paid
                    </Button>}
                {cancellable && <Button color="error" onClick={handleCancel}>
                    Cancel
                </Button>}
            </div>
        </div>
    </div>
}

export default FacilityOrder;