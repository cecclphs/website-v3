import { Edit, ErrorOutline, InfoRounded, SplitscreenOutlined, DeleteRounded } from '@mui/icons-material';
import { Button, Chip, ChipProps, DialogActions, DialogContent, Divider, ListItem, ListItemIcon, MenuItem, Popover, Tooltip } from '@mui/material';
import { updateDoc, deleteDoc, getDoc, doc, DocumentReference } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useDialog } from '../hooks/useDialog';
import InventoryItem from '../types/Inventory';
import { fetchAPI } from '../utils/fetchAPI';
import SplitInventoryDialog from './SplitInventoryDialog';
import StudentDetailsChip from './StudentDetailsChip';
import EditInventoryItem from './EditInventoryItem';
import { FC, useEffect, useState } from 'react';
import { db, docConverter } from '../config/firebase';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { useDocumentData } from 'react-firebase-hooks/firestore';

const InventoryItemViewer: FC<{ item: InventoryItem, onClose: () => void }> = ({ item: _item, onClose }) => {
    const [item = _item, loading, error] = useDocumentData<InventoryItem>(_item.ref.withConverter(docConverter));
    const { user } = useAuth();
    const [openDialog, closeDialog] = useDialog();
    const router = useRouter();
    const [itemPath, setItemPath] = useState<InventoryItem[]>([]);
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

    useEffect(() => {
        (async () => {
            if (!parent) return;
            //if the parent is not null, keep fetching parents till a null parent,
            //then set the itemPath to the parents
            let parentArray = [];
            let currentParent = parent;
            do {
                const parentDoc = await getDoc(doc(db, 'inventory', currentParent));
                const parentItem = parentDoc.data() as InventoryItem;
                currentParent = parentItem.parent;
                parentArray = [parentItem, ...parentArray];
            } while (currentParent !== null);
            setItemPath(parentArray);
        })();
    }, [item])

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
    
    const handleViewParent = (parentItem: InventoryItem) => () => {
        openDialog({
            children: <>
                <DialogContent>
                    <InventoryItemViewer item={parentItem} onClose={closeDialog} />
                </DialogContent>
            </>
        });
    }

    const handleEditItem = () => {
        openDialog({
            children: <EditInventoryItem inventoryItem={item} onComplete={onClose} />
        })
    }

    const reportLost = () => {
        updateDoc(item.ref, {
            status: 'lost'
        })
    }

    const reportFound = () => {
        updateDoc(item.ref, {
            status: "available"
        })
    }
    
    const handleSetParent = () => {
        router.push('/inventory?parent=' + id);
        onClose();
    }

    const getStatus = ({
        available: 'success',
        lost: 'error',
        borrowed: 'warning',
        broken: 'error',
    } as {[key in InventoryItem['status']]: ChipProps['color']})[status]

    if (!item) return <></>
    return <div className="flex flex-col w-[400px]">
        <div className="space-y-1 py-1">
            <Tooltip title={id}>
                <h1 className="text-3xl font-bold text-gray-800">{description} {type == 'item' ? `×${quantity || 1}` : ""}</h1>
            </Tooltip>
            <p className="text-sm">{simpleId}</p>
            <p className="text-sm">Status: <Chip size='small' label={status} color={getStatus} /></p>
            <p className="text-sm">Type: {type}</p>
            <p className="text-sm">Children: {children || 1}</p>
            <div className='flex flex-row text-sm space-x-1'>
                <span>Location: </span>
                {itemPath.length == 0 && <p>Already at the top</p>}
                {itemPath.map((p, i) => <p className="cursor-pointer" onClick={handleViewParent(p)}>{p.description}{(i != (itemPath.length -1))? '/':''}</p>)}
            </div>
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
            <PopupState variant="popover" popupId="demo-popup-popover">
                {(popupState) => (
                    <div>
                        <Button
                            {...bindTrigger(popupState)}
                            color="error"
                            startIcon={<ErrorOutline />}
                        >
                            Reporting
                        </Button>
                    <Popover
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        {status == 'lost' ? <MenuItem
                            color="success"
                            onClick={reportFound}
                        >
                            <ListItemIcon>
                                <ErrorOutline />
                            </ListItemIcon>
                            Item Found
                        </MenuItem>: 
                        <MenuItem
                            color="error"
                            onClick={reportLost}
                        >
                            <ListItemIcon>
                                <ErrorOutline />
                            </ListItemIcon>
                            Report Lost
                        </MenuItem>}
                    </Popover>
                    </div>
                )}
                </PopupState>
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