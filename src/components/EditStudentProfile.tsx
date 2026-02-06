import { Button, CircularProgress, DialogActions, DialogContent } from "@mui/material";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { forwardRef, PropsWithChildren, Ref } from "react";
import { useForm } from "react-hook-form";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "notistack";
import StudentDetails from "../types/StudentDetails";

const DataRowInput = forwardRef(({title, error, ...props}: PropsWithChildren<{title: string, error?: boolean}> & React.InputHTMLAttributes<HTMLInputElement>, ref: Ref<HTMLInputElement>) => (
    <div className="py-1">
        <h5 className={`text-xs font-semibold ${error ? 'text-red-500' : 'text-gray-500'}`}>{title}{error && ' *'}</h5>
        <input ref={ref} className={`text-base appearance-none w-full border-b border-solid ${error ? 'border-red-400' : 'border-indigo-400'} bg-transparent px-1 py-0.5`} {...props} />
    </div>
))

type EditableStudentFields = Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn' | 'linkedAccounts' | 'status' | 'photoURL'>;

const EditStudentProfile = ({ student, onClose }: { student: StudentDetails, onClose: () => void}) => {
    const { userToken } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const { id, ref, createdOn, modifiedOn, linkedAccounts, status, photoURL, ...studentdata} = student;
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditableStudentFields>({
        defaultValues: studentdata as EditableStudentFields,
        mode: 'onBlur'
    });

    const submit = async (data: EditableStudentFields) => {
        try {
            const trimmedData = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
            );
            trimmedData.englishName = trimmedData.englishName?.toUpperCase();

            await updateDoc(doc(db, 'students', student.studentid), {
                ...trimmedData,
                modifiedOn: Timestamp.now(),
            });
            enqueueSnackbar('Profile updated successfully', { variant: 'success' });
            onClose();
        } catch (error) {
            console.error('Update profile error:', error);
            enqueueSnackbar('Failed to update profile', { variant: 'error' });
        }
    }

    const editable = userToken?.isAdmin;

    return <>
        <DialogContent>
            <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
                <DataRowInput {...register("englishName", { required: true })} title="English Name" disabled={!editable} error={!!errors.englishName} />
                <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name" disabled={!editable} error={!!errors.chineseName} />
                <DataRowInput {...register("gender", { required: true })} title="Gender (Male or Female)" disabled={!editable} error={!!errors.gender} />
                <DataRowInput {...register("enrollmentDate", { required: true })} title="Enrollment Date (yyyy-mm-dd)" disabled={!editable} error={!!errors.enrollmentDate} />
                <DataRowInput {...register("class", { required: true })} title="Class" error={!!errors.class} />
                <DataRowInput {...register("studentid")} title="Student ID" disabled />
                <DataRowInput {...register("identification")} title="Identification Card/Passport" />
                <DataRowInput {...register("phone")} title="Phone" />
                <DataRowInput {...register("facebookURL")} title="Facebook URL" />
                <DataRowInput {...register("email")} title="Active Email" />
                <DataRowInput {...register("address")} title="Address" />
                <DataRowInput {...register("birthday")} title="Birthday" />
                <DataRowInput {...register("committeeRole")} title="Committee Role" />
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRowInput {...register("motherName")} title="Mother's Name" />
                <DataRowInput {...register("motherPhone")} title="Mother's Phone" />
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRowInput {...register("fatherName")} title="Father's Name" />
                <DataRowInput {...register("fatherPhone")} title="Father's Phone" />
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRowInput {...register("emergencyphone")} title="Emergency Phone" />
                <DataRowInput {...register("emergencyrelation")} title="Emergency Contact Relation (Parent/Guardian)" />
                <DataRowInput {...register("specials")} title="Specials" />
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button
                variant="contained"
                disabled={isSubmitting}
                onClick={handleSubmit(submit)}
            >
                {isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
        </DialogActions>
    </>
}

export default EditStudentProfile;
