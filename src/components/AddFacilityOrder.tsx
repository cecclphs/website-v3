import { AddRounded, FileOpenRounded, FileOpenTwoTone, FileUploadTwoTone } from "@mui/icons-material";
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { addDoc, collection, doc, setDoc, Timestamp, WithFieldValue } from "firebase/firestore";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { FacilityForm, FacilityOrderData } from "../types/Facility";
import { db, storage } from "../config/firebase";
import FormSelect from "./form-components/FormSelect";
import FormTextField from "./form-components/FormTextField";
import FormCheckbox from "./form-components/FormCheckbox";
import FormFilePicker from "./form-components/FormFilePicker";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useSnackbar } from 'notistack';

const AddFacilityOrder = () => {
    const { user, userDetails } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, setValue, control,  watch, formState: { isValid, errors }, reset } = useForm<FacilityForm>({
        defaultValues:{
            instructions: "",
            title: "",
            selfFab: true,
            agree: false
        },
        reValidateMode: 'onChange', // this in pair with mode seems to give the expected result
        mode: 'onChange',
    
    })
    const facility = watch('facility');
    const selectedFile = watch('file');
    const acceptFile = () => {
        switch(facility) {
            case '3dprinter':
                return 'application/sla'
            case 'lasercutter':
                return 'image/svg+xml';
        }
    }

    const onSubmit = async (data: FacilityForm) => {
        if(!user || !userDetails) return;
        const { title, facility, instructions, selfFab, file } = data;
        const { englishName, studentid } = userDetails;
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
        <h1 className="text-lg font-medium">Applying as {userDetails?.englishName} {userDetails?.studentid}</h1>
        <FormSelect
            control={control}
            name="facility"
            rules={{ required: true }}
            label="Apply To Use"
            variant="filled"
            options={[
                { label: '3D Printer', value: '3dprinter' },
                { label: 'Laser Cutter', value: 'lasercutter' },
            ]}
        />
        <div className="flex flex-row w-full space-x-2">
            <div className="flex-[2] flex flex-col space-y-2">
                <FormTextField
                    control={control}
                    name="title"
                    rules={{ required: true }}
                    variant="filled"
                    label="Item Name/Description"
                    />
                <FormTextField
                    multiline
                    control={control}
                    name="instructions"
                    label="Instructions"
                    />
                </div>
            <div className="w-[250px] flex flex-col">
                <FormFilePicker
                    control={control}
                    name="file"
                    rules={{ required: true }}
                    label="Upload File"
                    startIcon={<AddRounded/>}
                    variant="contained"
                    accept={acceptFile()}
                    multiple
                    />
                {selectedFile && Array.from(selectedFile).map((file) => 
                    <div className="flex flex-row justify-start space-x-2 items-center w-full py-2" key={file.name}>
                        <FileOpenTwoTone className="w-5 h-5 text-blue-800 opacity-80"/>
                        <div className="text-ellipsis overflow-hidden whitespace-nowrap text-gray-600">{file.name}</div>
                    </div>
                )}
            </div>
        </div>
        <FormCheckbox control={control} name="selfFab" label="I will fabricate this part myself." />
        <FormCheckbox control={control} rules={{required: true}} name="agree" label="I agree to the terms and conditions" />
        <div className="flex flex-row w-full justify-end">
            <Button disabled={!isValid} variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
        </div>
    </div>
}

export default AddFacilityOrder;