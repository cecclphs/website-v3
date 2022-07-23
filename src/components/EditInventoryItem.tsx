import {useEffect, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import FormTextField from './form-components/FormTextField';
import {Button} from '@mui/material';
import InventoryItem from '../types/Inventory';
import {updateDoc, collection, CollectionReference, Timestamp} from 'firebase/firestore';
import {db, docConverter} from '../config/firebase';
import {useAuth} from '../hooks/useAuth';
import FormSelect from './form-components/FormSelect';
import useKeyPress from '../hooks/useKeyPress';

type InventoryForm = {
    simpleId: string | null;
    description: string;
    type: InventoryItem['type']
    metadata: InventoryItem['metadata'],
    quantity: number;
    status: InventoryItem['status'];
}

const EditInventoryItem = ({ inventoryItem, onComplete }: { inventoryItem: InventoryItem, onComplete: () => void}) => {
    const { userToken } = useAuth();
    const pressSubmit = useKeyPress('Enter');
    const { handleSubmit, control,  setValue, watch, formState: { isValid, isSubmitting }, reset } = useForm<InventoryForm>({
        defaultValues: useMemo(() => ({
            simpleId: inventoryItem.simpleId,
            description: inventoryItem.description,
            type: inventoryItem.type,
            metadata: inventoryItem.metadata,
            quantity: inventoryItem.quantity,
            status: inventoryItem.status
        }), [inventoryItem]),
        reValidateMode: 'onChange', // this in pair with mode seems to give the expected result
        mode: 'onChange',
    })

    useEffect(() => {
        if(pressSubmit) handleSubmit(onSubmit)();
    }, [pressSubmit])

    const type = watch('type');

    const removeEmpty = (obj) => {
        let newObj = {};
        Object.keys(obj).forEach((key) => {
          if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
          else if (obj[key] !== undefined) newObj[key] = obj[key];
        });
        return newObj;
      };
      

    const onSubmit = async (data: InventoryForm) => {
        const sanitized = removeEmpty(data) as InventoryForm
        await updateDoc(inventoryItem.ref, {
            description: sanitized.description,
            simpleId: sanitized.simpleId,
            metadata: sanitized.metadata,
            type: sanitized.type,
            status: sanitized.status,
            ...(type === 'item' ? { quantity: sanitized.quantity } : {}),
        })
        onComplete();
        reset();
    }

    return <div className="flex flex-col space-y-2 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold">Editing {inventoryItem.description}</h3>
        <div className="flex flex-row space-x-1">
            <FormTextField
                control={control}
                name="simpleId"
                size="small"
                label="Simple ID"
                variant="filled" />
            {inventoryItem.type != 'item' && <FormSelect
                control={control}
                name="type"
                size="small"
                label="Type"
                variant="filled"
                sx={{minWidth: 'fit-content'}}
                options={[
                    { label: "Location", value: "location" },
                    { label: "Container", value: "container" },
                    { label: "Project", value: "project" },
                    { label: "Item", value: "item" },
                ]} />}
            <FormTextField
                autoFocus
                required
                fullWidth
                control={control}
                rules={{required: true}}
                name="description"
                size="small"
                label="Description"
                variant="filled" />
            {type == 'item' && <FormTextField
                required
                control={control}
                name="quantity"
                size="small"
                rules={{required: true}}
                label="Quantity"
                variant="filled"
                type="number" />}
            <FormSelect
                control={control}
                name="status"
                size="small"
                label="Status"
                variant="filled"
                sx={{minWidth: 'fit-content'}}
                options={[
                    //status: 'borrowed' | 'available' | 'lost' | 'broken'
                    { label: "Borrowed", value: "borrowed" },
                    { label: "Available", value: "available" },
                    { label: "Lost", value: "lost" },
                    { label: "Broken", value: "broken" },
                ]} />
        </div>
        <h3 className="text-xl font-semibold">Metadata - Optional</h3>
        <div className="flex flex-row space-x-2">
            <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-semibold">Details</h4>
                <FormTextField
                    control={control}
                    rules={{
                        transformValue: (value) => parseFloat(value),
                    }}
                    name="metadata.price"
                    type="number"
                    size="small"
                    label="Price"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.serialNumber"
                    size="small"
                    label="Serial Number"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.model"
                    size="small"
                    label="Model"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.brand"
                    size="small"
                    label="Brand"
                    margin="dense"
                    variant="outlined" />
            </div>
            <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-semibold">Purchase</h4>
                <FormTextField
                    control={control}
                    name="metadata.purchase.financeRef"
                    size="small"
                    label="Purchase Finance Ref"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.purchase.date"
                    size="small"
                    label="Purchased Date"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.purchase.supplier"
                    size="small"
                    label="Purchased Supplier"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.purchase.purchasedBy.englishName"
                    size="small"
                    label="Purchaser English Name"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.purchase.purchasedBy.studentid"
                    size="small"
                    label="Purchaser Student ID"
                    margin="dense"
                    variant="outlined" />
            </div>
            <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-semibold">Donated</h4>
                <FormTextField
                    control={control}
                    name="metadata.donatedBy"
                    size="small"
                    label="Donated By"
                    margin="dense"
                    variant="outlined" />
                <FormTextField
                    control={control}
                    name="metadata.donatedOn"
                    size="small"
                    label="Donated Date"
                    margin="dense"
                    variant="outlined" />
            </div>
            <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-semibold">Notes</h4>
                <FormTextField
                    multiline
                    control={control}
                    name="metadata.notes"
                    size="small"
                    label="Notes"
                    margin="dense"
                    variant="outlined" />
            </div>
        </div>
        <Button disabled={!isValid || isSubmitting} variant="outlined" color="primary" onClick={handleSubmit(onSubmit)}>Edit</Button>
    </div>
}

export default EditInventoryItem;