import { AddRounded } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import useToggle from "../hooks/useToggle";
import {addDoc, collection, Timestamp, WithFieldValue} from 'firebase/firestore';
import FormTextField from "./form-components/FormTextField";
import FormSelect from "./form-components/FormSelect";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import {FinanceAccountType} from '../types/Finance';

type AccountForm = {
    accountName: string;
    type: 'cash' | 'bank';
    initialBalance: string;
    notes?: string;
    metadata?: {
        [x: string]: any;
    },
}

const AddAccount = () => {
    const { userToken } = useAuth();
    const [open, setOpen] = useToggle();
    const { register, handleSubmit, setValue, control, watch, formState: { isValid, errors }, reset } = useForm<AccountForm>({
        defaultValues: {
        }
    });
    
    const handleCreate = async (data: AccountForm) => {
        console.log(data)
        await addDoc(collection(db, 'accounts'), {
            accountName: data.accountName,
            type: data.type,
            balance: parseFloat(data.initialBalance),
            notes: data.notes,
            metadata: {
                createdAt: Timestamp.now(),
                createdBy: {
                    studentid: userToken.studentid,
                    englishName: userToken.englishName,
                },
                ...data.metadata
            },
        } as Omit<FinanceAccountType, 'id' | 'ref'>);
        reset();
        setOpen();
    }

    return (
        <>
        <div className="grid place-items-center rounded-md border border-dashed border-gray-300 text-gray-500 cursor-pointer hover:text-gray-800" onClick={setOpen}>
            <div className="flex flex-row space-x-2 px-2">
                <AddRounded/>
                <span>Create New</span>
            </div>
        </div>
        <Dialog open={open} onClose={setOpen}>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogContent>
                <FormTextField
                    label="Account Name"
                    name="accountName"
                    control={control}
                    rules={{ required: true }}
                    variant="standard"
                    />
                <FormSelect
                    label="Type"
                    name="type"
                    control={control}
                    rules={{ required: true }}
                    variant="standard"
                    options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'bank', label: 'Bank' },
                    ]}
                    />
                <FormTextField
                    type="number"
                    label="Initial Balance"
                    name="initialBalance"
                    defaultValue={0}
                    control={control}
                    rules={{ required: true }}
                    variant="standard"
                    helperText="This is not balance acredited from other accounts"
                    />
                <FormTextField
                    label="Notes"
                    name="notes"
                    control={control}
                    variant="standard"
                    />
            </DialogContent>
            <DialogActions>
                <Button onClick={setOpen}>Cancel</Button>
                <Button onClick={handleSubmit(handleCreate)}>Create</Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default AddAccount;