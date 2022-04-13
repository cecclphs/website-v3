import { Edit, ErrorOutline, InfoRounded, SplitscreenOutlined, DeleteRounded } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, Divider } from '@mui/material';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useDialog } from '../hooks/useDialog';
import InventoryItem from '../types/Inventory';
import { fetchAPI } from '../utils/fetchAPI';
import SplitInventoryDialog from './SplitInventoryDialog';
import StudentDetailsChip from './StudentDetailsChip';
import EditInventoryItem from './EditInventoryItem';

const InventoryItemViewer = ({ item, onClose }: { item: InventoryItem, onClose: () => void }) => {
    const { user } = useAuth();
    const [openDialog, closeDialog] = useDialog();
    const router = useRouter();
    if (!item) return <></>
    const {
        id,
        description,
        type,
        parent,
        children,
        simpleId,
        status,
        metadata,
        registeredBy,
        quantity
    } = item || {};

    const handleSplit = () => {
        openDialog({
            children: <SplitInventoryDialog closeDialog={closeDialog} item={item} />
        });
    }

    const handleDeleteItem = () => {
        openDialog({
            children: <>
                <DialogContent>
                    <p>Are you sure you want to delete this item?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={async () => {
                        if(item.type == 'item') await deleteDoc(item.ref)
                        else await fetchAPI('/inventory/purge', user, { 
                            method: 'POST',
                            body: JSON.stringify({
                                deleteNode: item.id
                            })
                        })
                        closeDialog();
                        onClose();
                    }}>Delete</Button>
                </DialogActions>
            </>
        });
    }

    const handleEditItem = () => {
        openDialog({
            children: <>
                <DialogContent>
                    <EditInventoryItem inventoryItem={item} onComplete={closeDialog} />
                </DialogContent>
            </>
        })
    }

    const reportLost = () => {
        updateDoc(item.ref, {
            status: 'lost'
        })
        onClose();
    }

    const reportFound = () => {
        updateDoc(item.ref, {
            status: "available"
        })
        onClose();
    }
    
    const handleSetParent = () => {
        router.push('/inventory?parent=' + id);
        onClose();
    }

    return <div className="flex flex-col w-[400px]">
        <div className="space-y-1 py-1">
            <h1 className="text-3xl font-bold text-gray-800">{description} {type == 'item' ? `×${quantity || 1}` : ""}</h1>
            <p className="text-sm">{simpleId}</p>
            <p className="text-sm">Type: {type}</p>
            <p className="text-sm">Status: {status}</p>
            <p className="text-sm">Children: {children || 1}</p>
        </div>
        <Divider />
        <div className="space-y-1 py-1">
            <h2 className="text-xl font-bold text-gray-800">Metadata</h2>
            {metadata.donatedBy && <p className="text-sm">Donated by: {metadata.donatedBy}</p>}
            {metadata.donatedOn && <p className="text-sm">Donated on: {metadata.donatedOn}</p>}
            {metadata.serialNumber && <p className="text-sm">Serial number: {metadata.serialNumber}</p>}
            {metadata.model && <p className="text-sm">Model: {metadata.model}</p>}
            {metadata.price && <p className="text-sm">Price: RM {metadata.price}</p>}
            {metadata.brand && <p className="text-sm">Brand: {metadata.brand}</p>}
            {metadata.purchase?.date && <p className="text-sm">Purchased on: {metadata.purchase.date}</p>}
            {metadata.purchase?.supplier && <p className="text-sm">Purchased from: {metadata.purchase.supplier}</p>}
            {metadata.purchase?.purchasedBy?.englishName && <p className="text-sm">Purchased by: <StudentDetailsChip student={metadata.purchase.purchasedBy} /></p>}
            {metadata.purchase?.financeRef && <p className="text-sm">Finance ref: {metadata.purchase.financeRef}</p>}
            {metadata.notes && <p className="text-sm">Notes: {metadata.notes}</p>}
            {metadata.borrowedBy && <p className="text-sm">Borrowed by: {metadata.borrowedBy}</p>}
        </div>
        <Divider />
        <div className='space-y-1 py-1'>
            <h2 className="text-xl font-bold text-gray-800">Actions</h2>
            <div className="flex flex-row space-x-2">
                {status == 'lost' && <Button
                    color="success"
                    startIcon={<ErrorOutline />}
                    onClick={reportFound}
                >
                    Item Found
                </Button>}
                {status != 'lost' && <Button
                    color="error"
                    startIcon={<ErrorOutline />}
                    onClick={reportLost}
                >
                    Report Lost
                </Button>}
                {type == 'item' && 
                <Button 
                    disabled={quantity <= 1} 
                    startIcon={<SplitscreenOutlined />} 
                    onClick={handleSplit}
                >
                    Split Item
                </Button>}
                <Button 
                    color='info' 
                    startIcon={<Edit />}
                    onClick={handleEditItem}
                >
                    Edit Item
                </Button>
                {type != "item" && <Button 
                    color='info' 
                    startIcon={<InfoRounded />}
                    onClick={handleSetParent}
                >
                    Set Parent
                </Button>}
                <Button 
                    color='error' 
                    startIcon={<DeleteRounded />}
                    onClick={handleDeleteItem}
                >
                    Delete Item
                </Button>
            </div>
        </div>
        <p>Registered by: <StudentDetailsChip student={registeredBy} /></p>
    </div>
}

export default InventoryItemViewer;