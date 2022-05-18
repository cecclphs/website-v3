import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import FormTextField from "./form-components/FormTextField";
import { useAlgolia } from "use-algolia";
import { Autocomplete, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import InventoryItem from "../types/Inventory";
import { addDoc, collection, CollectionReference, Timestamp } from "firebase/firestore";
import { db, docConverter } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import FormSelect from "./form-components/FormSelect";
import useKeyPress from '../hooks/useKeyPress';

type InventoryHit = {
    simpleId: InventoryItem['simpleId'];
    description: InventoryItem['description'];
    parent: InventoryItem['parent'];
    status: InventoryItem['status'];
    objectID: string;
}

const SearchItem = ({ value, onChange }) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [searchState, requestDispatch, getMore] = useAlgolia<InventoryHit>(
        'UCUWLZ1S98',
        '4b8223c4366da4889262234911b1349f',
        'inventory',
        { hitsPerPage: 5 }
    );
    const { hits: options, response, loading, hasMore } = searchState;
    // const loading = open && options.length === 0;
    
    React.useEffect(() => {
        if(open) requestDispatch({ query: '', filter: ''})
    }, [open]);
    
    React.useEffect(() => {
        console.log(inputValue)
        requestDispatch({ query: inputValue, filter: ''});
    }, [inputValue]);
    
    return (
        <Autocomplete
            id="asynchronous-demo"
            sx={{ width: 300 }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option?.objectID === value?.objectID}
            getOptionLabel={(option) => option.name}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            autoComplete    
            options={options}
            loading={loading}
            value={value}
            onChange={onChange}
            renderOption={(params, option: InventoryHit) => (
                <MenuItem key={option?.objectID} {...params}>
                    {option.description}
                    {option.simpleId}
                </MenuItem>
            )}
            renderInput={(params) => (
                <TextField
                {...params}
                size="small"
                label="Parent"
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                    <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                    </React.Fragment>
                    ),
                }}
                />
            )}
        />
    );  
}

type InventoryForm = {
    simpleId: string | null;
    description: string;
    parent: string | null;
    metadata: InventoryItem['metadata'],
    type: InventoryItem['type'],
    quantity: number;
}

const CreateInventoryItem = ({ parent = null }: { parent?: string | null}) => {
    const { userToken } = useAuth();
    const pressSubmit = useKeyPress('Enter');
    const { register, handleSubmit, setValue, control,  watch, formState: { isValid, errors, isSubmitting }, reset } = useForm<InventoryForm>({
        defaultValues:{
            simpleId: null,
            description: "",
            parent,
            metadata: {},
            type: 'item',
            quantity: 1
        },
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
        await addDoc((collection(db, 'inventory') as CollectionReference<InventoryItem>).withConverter(docConverter), {
            description: sanitized.description,
            simpleId: sanitized.simpleId,
            parent,
            status: "available",
            children: 0,
            type: sanitized.type,
            metadata: sanitized.metadata,
            registeredBy: {
                studentid: userToken.studentid,
                englishName: userToken.englishName,
            },
            dateRegistered: Timestamp.now(),
            ...(type === 'item' ? { quantity: sanitized.quantity } : {}),
        })
        reset();
    }

    return <div className="flex flex-col space-y-2 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold">Adding Item</h3>
        <div className="flex flex-row space-x-1">
            <FormTextField
                control={control}
                name="simpleId"
                size="small"
                label="Simple ID"
                variant="filled" />
            <FormSelect
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
                ]} />
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
                label="Quantity"
                variant="filled"
                type="number" />}
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
                    label="Price (per unit)"
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
        
        {/* <Controller
            control={control}
            name="parent"
            render={({ field: { onChange, value }}) => (
                <SearchItem value={value} onChange={onChange}/>
            )}/> */}
        <Button disabled={!isValid || isSubmitting} variant="outlined" color="primary" onClick={handleSubmit(onSubmit)}>Create</Button>
    </div>
}

export default CreateInventoryItem;