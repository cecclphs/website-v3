import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, docConverter } from '../config/firebase';
import { AutocompleteChangeReason, AutocompleteChangeDetails } from '@mui/material/Autocomplete';

export default function AccountSelector({ hiddenIds=[], label, onChange, value={} }: { hiddenIds?: string[], label: string, onChange: (event: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<any>) => void, value: any }) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const loading = open && options.length === 0;
    React.useEffect(() => {
        let active = true;

        if (!loading) {
        return undefined;
        }

        (async () => {
        if (active) {
            let sync = await getDocs(collection(db,'financials').withConverter(docConverter))
            setOptions(sync.docs.map(doc => doc.data()).filter(item => !hiddenIds.includes(item.id)));
        }
        })();

        return () => {
        active = false;
        };
    }, [loading]);

    return (
        <Autocomplete
        id="asynchronous"
        sx={{ width: '250px' }}
        open={open}
        onOpen={() => {
            setOpen(true);
        }}
        onClose={() => {
            setOpen(false);
        }}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.accountName || ""}
        options={options}
        loading={loading}
        renderInput={(params) => (
            <TextField
            required
            {...params}
            label={label}
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
