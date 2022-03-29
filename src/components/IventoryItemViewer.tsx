import { Edit, ErrorOutline, SplitscreenOutlined } from '@mui/icons-material';
import {Button, DialogActions, DialogContent, Divider, TextField} from '@mui/material';
import { useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import InventoryItem from '../types/Inventory';
import SplitInventoryDialog from './SplitInventoryDialog';
import StudentDetailsChip from './StudentDetailsChip';

const InventoryItemViewer = ({ item }: { item: InventoryItem }) => {
    const [openDialog, closeDialog] = useDialog();
    if(!item) return <></>
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
            children: <SplitInventoryDialog closeDialog={closeDialog} item={item}/>
        });
    }

    return <div className="flex flex-col w-[400px]">
        <div className="space-y-1 py-1">
            <h1 className="text-3xl font-bold text-gray-800">{description} {type=='item'?`×${quantity || 1}`:""}</h1>
            <p className="text-sm">{simpleId}</p>
            <p className="text-sm">Type: {type}</p>
            <p className="text-sm">Status: {status}</p>
            <p className="text-sm">Children: {children || 1}</p>
        </div>
        <Divider/>
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
        <Divider/>
        <div className='space-y-1 py-1'>
            <h2 className="text-xl font-bold text-gray-800">Actions</h2>
            <div className="flex flex-row space-x-2">
                <Button color="error" startIcon={<ErrorOutline/>}>Report Lost</Button>
                {type == 'item' && <Button disabled={quantity <= 1} startIcon={<SplitscreenOutlined/>} onClick={handleSplit}>Split Item</Button>}
                <Button color='info' startIcon={<Edit/>}>Edit Item</Button>
            </div>
        </div>
        <p>Registered by: <StudentDetailsChip student={registeredBy} /></p>
    </div>
}

export default InventoryItemViewer;