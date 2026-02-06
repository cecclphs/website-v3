import { Button, CircularProgress, DialogActions, DialogContent } from "@mui/material";
import { doc, setDoc, Timestamp } from "firebase/firestore";
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

type AddStudentFields = Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn' | 'linkedAccounts' | 'photoURL' | 'status'>;

const AddStudentProfile = ({ onClose }: { onClose: () => void}) => {
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddStudentFields>({
        defaultValues: {
            englishName: '',
            chineseName: '',
            gender: 'Male',
            studentid: '',
            identification: '',
            phone: '',
            facebookURL: '',
            email: '',
            address: '',
            birthday: '',
            class: '',
            motherName: '',
            fatherName: '',
            motherPhone: '',
            fatherPhone: '',
            emergencyphone: '',
            emergencyrelation: '',
            specials: '',
            committeeRole: '',
            enrollmentDate: new Date().toISOString().split('T')[0],
        },
        mode: 'onSubmit'
    });

    const submit = async (data: AddStudentFields) => {
        try {
            const trimmedData = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
            );
            trimmedData.englishName = trimmedData.englishName?.toUpperCase();

            await setDoc(doc(db, 'students', trimmedData.studentid), {
                ...trimmedData,
                migrated: true,
                linkedAccounts: [],
                photoURL: `https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${trimmedData.studentid}.png`,
                status: "enrolled",
                createdOn: Timestamp.now(),
                modifiedOn: Timestamp.now()
            }, { merge: true });
            enqueueSnackbar('Student created successfully', { variant: 'success' });
            onClose();
        } catch (error) {
            console.error('Create student error:', error);
            enqueueSnackbar('Failed to create student', { variant: 'error' });
        }
    }

    return <>
        <DialogContent>
            <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Student Details</h2>
                <DataRowInput {...register("englishName", { required: true })} title="English Name" error={!!errors.englishName} />
                <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name" error={!!errors.chineseName} />
                <DataRowInput {...register("studentid", {
                    required: "Student ID is required",
                    validate: {
                        noWhitespace: (value) => value.trim() === value || "No leading/trailing spaces",
                        notEmpty: (value) => value.trim().length > 0 || "Cannot be empty"
                    }
                })} title="Student ID" error={!!errors.studentid} />
                <DataRowInput {...register("class", { required: true })} title="Class" error={!!errors.class} />
                <DataRowInput {...register("gender", { required: true })} title="Gender (Male or Female)" error={!!errors.gender} />
                <DataRowInput {...register("enrollmentDate", { required: true })} title="Enrollment Date (yyyy-mm-dd)" error={!!errors.enrollmentDate} />
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
                {isSubmitting ? <CircularProgress size={20} /> : 'Create'}
            </Button>
        </DialogActions>
    </>
}

export default AddStudentProfile;
