import { Button, DialogActions, DialogContent } from "@mui/material";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { forwardRef, PropsWithChildren, Ref } from "react";
import { useForm } from "react-hook-form";
import { db } from "../config/firebase";
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
        // Trim all string fields to prevent whitespace issues
        const trimmedData = {
            ...data,
            studentid: data.studentid?.trim(),
            englishName: data.englishName?.trim().toUpperCase(),
            chineseName: data.chineseName?.trim(),
            class: data.class?.trim(),
            gender: data.gender?.trim(),
            identification: data.identification?.trim(),
            phone: data.phone?.trim(),
            facebookURL: data.facebookURL?.trim(),
            email: data.email?.trim(),
            address: data.address?.trim(),
            motherName: data.motherName?.trim(),
            motherPhone: data.motherPhone?.trim(),
            fatherName: data.fatherName?.trim(),
            fatherPhone: data.fatherPhone?.trim(),
            emergencyphone: data.emergencyphone?.trim(),
            emergencyrelation: data.emergencyrelation?.trim(),
            specials: data.specials?.trim(),
        };

        await updateDoc(doc(db, 'students', student.studentid), {
            ...trimmedData,
            modifiedOn: Timestamp.now(),
        });
        onClose();
    }

    const editable = userToken.isAdmin
    const fillall = !userToken.isAdmin

    return <>
        <DialogContent>
            <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
                {/* @ts-ignore */}
                {editable && <DataRowInput {...register("englishName", { required: true })} title="English Name"/>}
                {editable && <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name"/>}
                {editable && <DataRowInput {...register("gender", { required: true })} title="Gender (Male or Female)"/>}
                {editable && <DataRowInput {...register("enrollmentDate", { required: true })} title="Enrollment Date (yyyy-mm-dd)"/>}
                <DataRowInput {...register("class", { required: fillall })} title="Class"/>
                <DataRowInput {...register("identification", { required: fillall })} title="Identification Card/Passport"/>
                <DataRowInput {...register("phone", { required: fillall })} title="Phone"/>
                <DataRowInput {...register("facebookURL", { required: fillall })} title="Facebook URL"/>
                <DataRowInput {...register("email", { required: fillall })} title="Active Email"/>
                <DataRowInput {...register("address", { required: fillall })} title="Address"/>
                <DataRowInput {...register("birthday", { required: fillall })} title="Birthday"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRowInput {...register("motherName", { required: fillall })} title="Mother's Name"/>
                <DataRowInput {...register("motherPhone", { required: fillall })} title="Mother's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRowInput {...register("fatherName", { required: fillall })} title="Father's Name"/>
                <DataRowInput {...register("fatherPhone", { required: fillall })} title="Father's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRowInput {...register("emergencyphone", { required: fillall })} title="Emergency Phone"/>
                <DataRowInput {...register("emergencyrelation", { required: fillall })} title="Emergency Contact Relation (Parent/Guardian)"/>
                <DataRowInput {...register("specials")} title="Specials"/>
            </form>
        </DialogContent>
        <DialogActions>
            <Button disabled={!isValid} onClick={handleSubmit(submit)}>Submit</Button>
        </DialogActions>
    </>
}

export default EditStudentProfile;