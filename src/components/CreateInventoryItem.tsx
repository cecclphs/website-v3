import React from "react";
import { Controller, useForm } from "react-hook-form";
import FormTextField from "./form-components/FormTextField";
import { useAlgolia } from "use-algolia";
import { Autocomplete, CircularProgress, MenuItem, TextField } from "@mui/material";

type InventoryForm = {
    name: string;
    parent: string | null;
}

type InventoryHit = {
    simpleId: string;
    name: string;
    parent: string | null;
    children: string[] | null;
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
                    {option.name}
                    {option.simpleId}
                </MenuItem>
            )}
            renderInput={(params) => (
                <TextField
                {...params}
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

const CreateInventoryItem = () => {
    const { register, handleSubmit, setValue, control,  watch, formState: { isValid, errors }, reset } = useForm<InventoryForm>({
        defaultValues:{
            name: "",
            parent: null
        },
        reValidateMode: 'onChange', // this in pair with mode seems to give the expected result
        mode: 'onChange',
    
    })

    return <div className="flex flex-col">
        <FormTextField
            control={control}
            name="name"
            label="Name" />
        <Controller
            control={control}
            name="parent"
            render={({ field: { onChange, value }}) => (
                <SearchItem value={value} onChange={onChange} />
            )}/>
    </div>
}

export default CreateInventoryItem;