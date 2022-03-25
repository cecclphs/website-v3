import {Controller, useForm} from 'react-hook-form';
import {FacilityForm, FacilityOrderData} from '../types/Facility';
import {AddRounded, FileOpenTwoTone} from '@mui/icons-material';
import {Button} from '@mui/material';
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

type TransactionForm = {
    description: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    account: any;
    toAccount?: any;
    date: Date;
    invoices: FileList;
    remarks?: string;
    metadata: {}
}

const NewTransaction = () => {
    const { user, userToken, userDetails } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, setValue, control,  watch, formState: { isValid, errors }, reset } = useForm<TransactionForm>({
        defaultValues:{
            description: "",
            amount: 0,
            account: {},
            date: new Date(),
            metadata: {}
        },
        reValidateMode: 'onChange', // this in pair with mode seems to give the expected result
        mode: 'onChange',
    
    })

    const transactionType = watch('type');

    const onSubmit = async (data: FacilityForm) => {
        if(!user || !userToken) return;
        const { title, facility, instructions, selfFab, file } = data;
        const { englishName, studentid } = userToken;
        console.log(data)
        const newDoc = doc(collection(db, "fab_orders"))
        const files = await Promise.all(Array.from(data.file).map(async (file) => {
            const snap = await uploadBytes(ref(storage, `fab_order/${newDoc.id}/${file.name}`), file);
            return {filename: file.name, url: await getDownloadURL(snap.ref), filesize: file.size};
        }))
        await setDoc(newDoc, {
            title,
            facility,
            instructions,
            selfFab,
            files,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            requestedBy: {
                englishName,
                studentid
            },
        } as unknown as WithFieldValue<FacilityOrderData>)
        enqueueSnackbar("Order submitted successfully", {
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
        {transactionType && (transactionType === 'transfer' ? <div className='flex flex-row'> {/* Transfer Between Accounts */}
            <Controller
                control={control}
                name="account"
                rules={{ required: true }}
                render={({ field: { onChange, value }}) => 
                    <AccountSelector label="From Account" onChange={(e, val) => onChange(val)} value={value} />
                }
            />
            <Controller
                control={control}
                name="toAccount"
                rules={{ required: true }}
                render={({ field: { onChange, value }}) => 
                    <AccountSelector label="To Account" onChange={(e, val) => onChange(val)} value={value}/>
                }
            />
        </div>:
        <div className='flex flex-row'> {/* Income or Expense */}
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
        </div>)}
        
        <FormTextField
            control={control}
            name="remarks"
            label="Remarks"
            variant="filled"
        />
        <FormTextField
            required
            control={control}
            name="amount"
            rules={{ required: true }}
            label="Amount"
            variant="filled"
            type="number"
            inputProps={{
                min: 0,
                step: 0.01,
            }}
        />
        
        <div className="flex flex-row w-full justify-end">
            <Button disabled={!isValid} variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
        </div>
    </div>

}

export default NewTransaction;