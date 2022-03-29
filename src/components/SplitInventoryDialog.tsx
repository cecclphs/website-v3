import {Button, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import { collection, doc, runTransaction } from 'firebase/firestore';
import {useState} from 'react';
import { db } from '../config/firebase';
import InventoryItem from '../types/Inventory';
const SplitInventoryDialog = ({ item, closeDialog }: {item: InventoryItem, closeDialog: () => void}) => {
    const [quantity, setQuantity] = useState(1);
    if(!item) return <></>
    return <>
    <DialogTitle>How much do you want to split?</DialogTitle>
    <DialogContent>
        <TextField
            fullWidth
            label="Quantity"
            type="number"
            variant="outlined"
            value={quantity}
            margin="dense"
            inputProps={{
                min: 1,
                max: (item.quantity || 0) - 1
            }}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button onClick={() => {
            //check if original quantity is less than quantity -1 (if so, don't split)
            if(item.quantity - quantity < 1) return;
            runTransaction(db, async (transaction) => {
                const existingItem = (await transaction.get(item.ref)).data()
                //remove quantity from existing, then add a new item with same properties but new quantity
                transaction.update(item.ref, {
                    quantity: existingItem.quantity - quantity
                })
                const { id, ref, ...newItem } = existingItem;
                transaction.set(doc(collection(db, 'inventory')), {
                    ...newItem,
                    quantity: quantity
                })
            }).then(closeDialog);
        }}>Split</Button>
    </DialogActions>
    </>
}

export default SplitInventoryDialog;