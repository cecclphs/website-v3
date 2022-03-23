import { AddRounded, FileOpenRounded, FileOpenTwoTone, FileUploadTwoTone } from "@mui/icons-material";
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { addDoc, collection, Timestamp, WithFieldValue } from "firebase/firestore";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { FacilityForm, FacilityOrderData } from "../types/Facility";
import { db } from "../config/firebase";
const AddFacility = () => {
    const { user, userDetails } = useAuth();
    const { register, handleSubmit, setValue, watch, formState: { isValid, errors } } = useForm<FacilityForm>({
        defaultValues:{
            selfFab: true,
            agree: false
        }
    })
    console.log(errors)
    console.log(isValid)
    const { title, facility, instructions, agree, selfFab, file: selectedFile } = watch();
    const acceptFile = () => {
        switch(facility) {
            case '3dprinter':
                return 'application/sla'
            case 'lasercutter':
                return 'image/svg+xml';
        }
    }

    useEffect(() => {
        register('facility', { required: true });
        register('title', { required: true });
        register('instructions');
        register('file', { required: true });
        register('selfFab', { required: true });
        register('agree', { value: true });
    })

    const onSubmit = (data: FacilityForm) => {
        if(!user || !userDetails) return;
        const { title, facility, instructions, selfFab, file } = data;
        const { englishName, studentid } = userDetails;
        console.log(data)
        addDoc(collection(db, 'orders'), {
            title,
            facility,
            instructions,
            selfFab,
            status: 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            requestedBy: {
                englishName,
                studentid
            },
        } as unknown as WithFieldValue<FacilityOrderData>)
    }

    return <div className="flex flex-col rounded-lg shadow-lg p-4 space-y-2">
        <h1 className="text-lg font-medium">Applying as {userDetails?.englishName} {userDetails?.studentid}</h1>
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Apply To Use</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={facility}
                label="Apply To Use"
                onChange={(e) => setValue('facility', e.target.value as '3dprinter' | 'lasercutter')}
            >
                <MenuItem value={'3dprinter'}>3D Printer</MenuItem>
                <MenuItem value={'lasercutter'}>Laser Cutter</MenuItem>
            </Select>
        </FormControl>
        <div className="flex flex-row w-full space-x-2">
            <div className="flex-[2] flex flex-col space-y-2">
                <TextField
                    label="Item Name/Description"
                    variant="filled"
                    name="title"
                    value={title}
                    onChange={(e) => setValue('title', e.target.value)}
                    />
                <TextField
                    multiline
                    label="Instructions"
                    variant="outlined"
                    name="instructions"
                    value={instructions}
                    onChange={(e) => setValue('instructions', e.target.value)}
                    />
                </div>
            <div className="w-[250px] flex flex-col">
                <label htmlFor="contained-button-file">
                    <input accept={acceptFile()} className="hidden" id="contained-button-file" multiple type="file" onChange={(e) => { 
                        if(e.target.files) setValue('file', e.target.files)} 
                    }/>
                    <Button variant="contained" component="span" disabled={!facility} startIcon={<AddRounded/>}>
                        Upload
                    </Button>
                </label>
                {selectedFile && Array.from(selectedFile).map((file) => 
                    <div className="flex flex-row justify-start space-x-2 items-center w-full py-2">
                        <FileOpenTwoTone className="w-5 h-5 text-blue-800 opacity-80"/>
                        <div className="text-ellipsis overflow-hidden whitespace-nowrap text-gray-600">{file.name}</div>
                    </div>
                )}
            </div>
        </div>
        <FormControlLabel control={<Checkbox checked={selfFab} onChange={(e) => setValue('selfFab', e.target.checked)} />} label="I will be fabricating this myself" />
        <FormControlLabel control={<Checkbox checked={agree} onChange={(e) => setValue('agree', e.target.checked)} />} label="I agree to the conditions for fabricating this object" />
        <div className="flex flex-row w-full justify-end">
            <Button disabled={!isValid} variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
        </div>
    </div>
}

export default AddFacility;