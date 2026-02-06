import { Button, DialogActions, DialogContent } from "@mui/material";
import { arrayUnion, doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
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


const AddStudentProfile = ({ onClose }: { onClose: () => void}) => {
    const { userToken } = useAuth();
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn'>>({
        defaultValues: {},
        mode: 'onChange'
    });
    
    const submit = async (data: Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn'>) => {
        // Trim all string fields to prevent whitespace issues
        const trimmedData = {
            ...data,
            studentid: data.studentid.trim(),
            englishName: data.englishName.trim(),
            chineseName: data.chineseName.trim(),
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

        await setDoc(doc(db, 'students', trimmedData.studentid), {
            ...trimmedData,
            migrated: true,
            linkedAccounts: [],
            photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${trimmedData.studentid}.png`,
            status: "enrolled",
            createdOn: Timestamp.now(),
            modifiedOn: Timestamp.now()
        }, { merge: true });
        onClose();
    }

    return <>
        <DialogContent>
            <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Student Details</h2>
                {/* @ts-ignore */}
                <DataRowInput {...register("englishName", { required: true })} title="English Name"/>
                <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name"/>
                <DataRowInput {...register("studentid", {
                    required: "Student ID is required",
                    validate: {
                        noWhitespace: (value) => value.trim() === value || "Student ID cannot have leading or trailing spaces",
                        notEmpty: (value) => value.trim().length > 0 || "Student ID cannot be empty"
                    }
                })} title="Student ID"/>
                <DataRowInput {...register("class", { required: true })} title="Class"/>
                <DataRowInput {...register("gender", { required: true })} title="Gender (Male or Female)"/>
                <DataRowInput {...register("enrollmentDate", { required: true })} title="Enrollment Date (yyyy-mm-dd)"/>
                <DataRowInput {...register("identification")} title="Identification Card/Passport"/>
                <DataRowInput {...register("phone")} title="Phone"/>
                <DataRowInput {...register("facebookURL")} title="Facebook URL"/>
                <DataRowInput {...register("email")} title="Active Email"/>
                <DataRowInput {...register("address")} title="Address"/>
                <DataRowInput {...register("birthday")} title="Birthday"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRowInput {...register("motherName")} title="Mother's Name"/>
                <DataRowInput {...register("motherPhone")} title="Mother's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRowInput {...register("fatherName")} title="Father's Name"/>
                <DataRowInput {...register("fatherPhone")} title="Father's Phone"/>
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRowInput {...register("emergencyphone")} title="Emergency Phone"/>
                <DataRowInput {...register("emergencyrelation")} title="Emergency Contact Relation (Parent/Guardian)"/>
                <DataRowInput {...register("specials")} title="Specials"/>
            </form>
        </DialogContent>
        <DialogActions>
            <Button disabled={!isValid} onClick={handleSubmit(submit)}>Create</Button>
        </DialogActions>
    </>
}

export default AddStudentProfile;