import {Controller, useForm} from 'react-hook-form';
import {FacilityForm, FacilityOrderData} from '../types/Facility';
import {AddRounded, CloudUploadRounded, FileOpenTwoTone} from '@mui/icons-material';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {collection, doc, setDoc, Timestamp, WithFieldValue} from 'firebase/firestore';
import {db, storage} from '../config/firebase';
import FormSelect from './form-components/FormSelect';
import FormTextField from './form-components/FormTextField';
import FormCheckbox from './form-components/FormCheckbox';
import FormFilePicker from './form-components/FormFilePicker';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';
import { useSnackbar } from 'notistack';
import AccountSelector from './AccountSelector';
import FormDatePicker from './form-components/FormDatePicker';
import { useDialog } from '../hooks/useDialog';
import { useState } from 'react';
import useToggle from '../hooks/useToggle';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { Transaction } from '../types/Finance';


type TransactionForm = {
    description: string
    amount: string,
    type: 'income' | 'expense' | 'transfer'
    account: any;
    toAccount?: any;
    date: Date;
    invoices: {file?: File, url?: string, caption?: string}[];
    remarks?: string;
    metadata: {}
}

const NewTransaction = () => {
    const { user, userToken, userDetails } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [openDialog, closeDialog] = useDialog();
    const [invoice, setInvoice] = useState<{file?: File, url?: string, caption?: string}>({});
    const [openAddInvoice, setOpenAddInvoice] = useToggle();
    const { register, handleSubmit, setValue, control,  watch, formState: { isValid, errors }, reset } = useForm<TransactionForm>({
        defaultValues:{
            description: "",
            amount: "",
            account: {},
            date: new Date(),
            metadata: {},
            invoices: []
        },
        reValidateMode: 'onChange', // this in pair with mode seems to give the expected result
        mode: 'onChange',
    
    })

    const transactionType = watch('type');
    const account = watch('account');
    const toAccount = watch('toAccount');

    const invoices = watch('invoices')
    const handleAddInvoice = async (e: any) => {
        setValue('invoices', [...invoices, invoice]);
        setInvoice({});
        setOpenAddInvoice();
    }

    const onSubmit = async (data: TransactionForm) => {
        if(!user || !userToken) return;
        const { englishName, studentid } = userToken;
        const { description, amount, type, account, toAccount, date, invoices, remarks } = data;
        console.log(data)
        const newDoc = doc(collection(db, "transactions"));
        const files = await Promise.all(Array.from(invoices).map(async (invoice) => {
            const snap = await uploadBytes(ref(storage, `transactions/${newDoc.id}/${invoice.file.name}`), invoice.file);
            return {url: await getDownloadURL(snap.ref), caption: invoice.caption};
        }))
        await setDoc(newDoc, {
            type,
            amount: parseFloat(amount),
            description,
            date: Timestamp.fromDate(date),
            status: 'pending',
            invoices: files,
            account: account.id,
            metadata: {},
            registeredBy: {
                englishName,
                studentid
            },
            ...remarks?{remarks}:{},
            ...toAccount?{ toAccount: toAccount.id}: {},
        } as unknown as WithFieldValue<Transaction>)
        enqueueSnackbar("Transaction created successfully", {
            variant: 'success',
        })
        reset();
    }

    return <div className="flex flex-col space-y-2">
        <FormSelect
            required
            control={control}
            name="type"
            rules={{ required: true }}
            label="Transaction Type"
            variant="filled"
            options={[
                { label: 'Income', value: 'income' },
                { label: 'Expense', value: 'expense' },
                { label: 'Transfer', value: 'transfer' },
            ]}
        />
        {transactionType && <>
         {transactionType === 'transfer' ? 
            <div className='flex flex-row space-x-2'> {/* Transfer Between Accounts */}
                <Controller
                    control={control}
                    name="account"
                    rules={{ required: true }}
                    render={({ field: { onChange, value }}) => 
                        <AccountSelector label="From Account" onChange={(e, val) => onChange(val)} value={value} hiddenIds={[toAccount?.id]} />
                    }
                />
                <Controller
                    control={control}
                    name="toAccount"
                    rules={{ required: true }}
                    render={({ field: { onChange, value }}) => 
                        <AccountSelector label="To Account" onChange={(e, val) => onChange(val)} value={value} hiddenIds={[account?.id]}/>
                    }
                />
            </div>:
            <div className='flex flex-row space-x-2'> {/* Income or Expense */}
                <Controller
                    control={control}
                    name="account"
                    rules={{ required: true }}
                    render={({ field: { onChange, value }}) => 
                        <AccountSelector label="From Account" onChange={(e, val) => onChange(val)} value={value} />
                    }
                />
                <FormTextField
                    required
                    control={control}
                    name="description"
                    rules={{ required: true }}
                    label="Description"
                    variant="filled"
                />
            </div>}
            <FormDatePicker
                control={control}
                name="date"
                rules={{ required: true }}
                label="Date"
                />
            <FormTextField
                control={control}
                name="remarks"
                label="Remarks"
                variant="filled"
            />
            <div className="flex flex-row space-x-2 p-3 border-b-2 border-solid border-gray-400 focus-within:border-blue-700 transition rounded-sm">
                <span className="text-3xl font-semibold text-gray-500">RM</span>
                <input 
                    {...register('amount', { required: true })}
                    type="number" 
                    className="w-full text-3xl font-medium focus:ring-0 focus-visible:outline-0" 
                    placeholder="0.00"/>
            </div>
            <div className='flex flex-col space-y-2'>
                {invoices.length > 0 && <h1 className="text-2xl font-semibold text-gray-500">Invoices</h1>}
                <div className='flex flex-row space-x-2'>
                {invoices.map((invoice, index) => (<Zoom>
                    <div className="flex flex-col items-center">
                        <img src={invoice.url} className="w-32" />
                        <h2 className='text-sm'>{invoice.caption}</h2>
                    </div>
                </Zoom>))}
                </div>
                <Button variant="contained" color="primary" startIcon={<AddRounded />} onClick={setOpenAddInvoice}>Add Invoice</Button>
            </div>
        </>}
        <div className="flex flex-row w-full justify-end">
            <Button disabled={!isValid} variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
        </div>
        <Dialog open={openAddInvoice} onClose={setOpenAddInvoice}>
            <DialogTitle>Add Invoice</DialogTitle>
            <DialogContent>
                {/* Upload File */}
                {!invoice.file && <label className="flex flex-col w-full" htmlFor="upload-invoice">
                    <input
                        className="hidden"
                        accept="image/*"
                        id='upload-invoice'
                        type="file"
                        onChange={e => setInvoice({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })}
                    />
                    <Button
                        component="span"
                        startIcon={<CloudUploadRounded />}
                    >
                        Upload Invoice
                    </Button>
                </label>}
                {invoice.file && <div className="flex flex-col w-full items-center">
                    <h2 className="font-semibold text-xl">Any Captions?</h2>
                    <Zoom><img src={invoice.url} alt="invoice" className='w-full object-contain' /></Zoom>
                    <TextField 
                        value={invoice?.caption || ""}
                        onChange={e => setInvoice({ ...invoice, caption: e.target.value })}
                        label="Caption"
                        variant="standard"
                    />
                </div>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setOpenAddInvoice(); setInvoice({});}}>Cancel</Button>
                {invoice.file && <Button onClick={handleAddInvoice}>Add</Button>}
            </DialogActions>
        </Dialog>
    </div>

}

export default NewTransaction;