import { Button, DialogActions, DialogContent } from "@mui/material";
import { Timestamp, updateDoc } from "firebase/firestore";
import { forwardRef, PropsWithChildren, Ref } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import StudentDetails from "../types/StudentDetails";

const DataRowInput = forwardRef(({title, ...props}: PropsWithChildren<{title: string}>, ref: Ref<any>) => (
    <div className="py-1">
        <h5 className="text-xs font-semibold text-gray-500">{title}</h5>
        <input ref={ref} className="text-base appearance-none w-full border-b border-solid border-indigo-400" {...props} />
    </div>
))


const EditStudentProfile = ({ student, onClose }: { student: StudentDetails, onClose: () => void}) => {
    const { userToken } = useAuth();
    const { id, ref, createdOn, modifiedOn, linkedAccounts, status, photoURL, ...studentdata} = student;
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn'>>({
        defaultValues: studentdata,
        mode: 'onChange'
    });
    
    const submit = async (data: Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn'>) => {
        await updateDoc(ref, {
            ...data,
            modifiedOn: Timestamp.now()
        });
        onClose();
    }

    const editable = userToken.isAdmin

    return <>
        <DialogContent>
            <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
                {/* @ts-ignore */}
                {editable && <DataRowInput {...register("englishName", { required: true })} title="English Name"/>}
                {editable && <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name"/>}
                {editable && <DataRowInput {...register("studentid", { required: true })} title="Student ID"/>}
                <DataRowInput {...register("identification", { required: true })} title="Identification Card/Passport"/>
                <DataRowInput {...register("phone", { required: true })} title="Phone"/>
                <DataRowInput {...register("facebookURL", { required: true })} title="Facebook URL"/>
                <DataRowInput {...register("email", { required: true })} title="Active Email"/>
                <DataRowInput {...register("address", { required: true })} title="Address"/>
                <DataRowInput {...register("birthday", { required: true })} title="Birthday"/>
                <DataRowInput {...register("class", { required: true })} title="Class"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRowInput {...register("motherName", { required: true })} title="Mother's Name"/>
                <DataRowInput {...register("motherPhone", { required: true })} title="Mother's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRowInput {...register("fatherName", { required: true })} title="Father's Name"/>
                <DataRowInput {...register("fatherPhone", { required: true })} title="Father's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRowInput {...register("emergencyphone", { required: true })} title="Emergency Phone"/>
                <DataRowInput {...register("emergencyrelation", { required: true })} title="Emergency Contact Relation (Parent/Guardian)"/>
                <DataRowInput {...register("specials")} title="Specials"/>
            </form>
        </DialogContent>
        <DialogActions>
            <Button disabled={!isValid} onClick={handleSubmit(submit)}>Submit</Button>
        </DialogActions>
    </>
}

export default EditStudentProfile;