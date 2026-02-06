import { EditRounded, Save, Cancel } from '@mui/icons-material';
import { LinearProgress, IconButton, Button, CircularProgress } from '@mui/material';
import Page from '../components/Page';
import { useAuth } from '../hooks/useAuth';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/router';
import StudentDetails from '../types/StudentDetails';
import { useSnackbar } from 'notistack';
import { forwardRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DataRow = ({title, info}: {title: string, info: string}) => {
    return <tr>
        <td className='text-xs sm:text-sm font-semibold py-2 w-[120px] sm:w-[200px] align-top'>{title}</td>
        <td className='text-sm sm:text-base py-2 break-words'>{info}</td>
    </tr>
}

const DataRowEditable = forwardRef<HTMLInputElement, {title: string} & React.InputHTMLAttributes<HTMLInputElement>>(
    ({title, ...inputProps}, ref) => {
        return <tr>
            <td className='text-xs sm:text-sm font-semibold py-2 w-[120px] sm:w-[200px] align-top'>{title}</td>
            <td>
                <input
                    ref={ref}
                    className="text-sm sm:text-base appearance-none w-full border-b border-solid border-indigo-400 bg-indigo-50 px-1 py-0.5 rounded-t"
                    {...inputProps}
                />
            </td>
        </tr>
    }
);

type EditableFields = Omit<StudentDetails, 'id' | 'ref' | 'createdOn' | 'modifiedOn' | 'linkedAccounts' | 'photoURL' | 'status'>;

const FullUserProfile = ({ userDetails, isUser = false }:{ userDetails: StudentDetails, isUser?: boolean}) => {
    const { user, userToken } = useAuth();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [editMode, setEditMode] = useState(false);
    const isLoading = !userDetails;

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<EditableFields>();

    const startEdit = () => {
        const { id, ref, createdOn, modifiedOn, linkedAccounts, photoURL, status, ...editable } = userDetails;
        reset(editable);
        setEditMode(true);
    };

    const cancelEdit = () => {
        setEditMode(false);
    };

    const onSubmit = async (data: EditableFields) => {
        try {
            const trimmedData = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
            );
            trimmedData.englishName = trimmedData.englishName?.toUpperCase();

            await updateDoc(doc(db, 'students', userDetails.studentid), {
                ...trimmedData,
                modifiedOn: Timestamp.now(),
            });
            enqueueSnackbar('Profile updated successfully', { variant: 'success' });
            setEditMode(false);
        } catch (error) {
            console.error('Update profile error:', error);
            enqueueSnackbar('Failed to update profile', { variant: 'error' });
        }
    };

    const {
        englishName,
        chineseName,
        class: className,
        status,
        studentid,
        gender,
        enrollmentDate,
        identification,
        phone,
        facebookURL,
        email,
        address,
        birthday,
        committeeRole,
        motherName,
        motherPhone,
        fatherName,
        fatherPhone,
        emergencyphone,
        emergencyrelation,
        specials
    } = userDetails || {};

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!user || !isUser) return;
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 512,
            useWebWorker: true
        }));
        reader.onload = async () => {
            fetch('/api/user/update_picture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                    image: reader.result as string,
                })
            }).then(async res => {
                const { error } = await res.json()
                if(res.status === 200) router.reload()
                else {
                    enqueueSnackbar('Failed to upload picture: '+ error, { variant: 'error' });
                }
            })
        }
    }

    const canEdit = userToken?.isAdmin || isUser;

    return <>
        {isLoading?<div className="grid place-items-center">
            <LinearProgress />
        </div>:
        <div className="flex flex-col">
            <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-start sm:items-center mb-3'>
                <div className='relative w-16 h-16 sm:w-20 sm:h-20'>
                    <label className="absolute left-0 top-0" htmlFor="pfpicture">
                        <input
                            disabled={!isUser}
                            className="hidden"
                            accept="image/*"
                            id="pfpicture"
                            type="file"
                            onChange={handleUpload}
                        />
                        <div id="pfpicture" className={`w-16 h-16 sm:w-20 sm:h-20 grid place-items-center transition opacity-0 bg-black/30 ${isUser?'hover:opacity-100 cursor-pointer':''} rounded-full`}>
                            <EditRounded className="text-white"/>
                        </div>
                    </label>
                    <img src={userDetails?.photoURL+'?'+Date.now()} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-[4px] sm:border-[6px] border-solid border-white shadow-xl" alt="User Profile"/>
                </div>
                <div className="flex flex-col flex-1">
                    <h1 className='text-xl sm:text-2xl font-semibold'>{chineseName} {englishName}</h1>
                    <h2 className='text-sm sm:text-base font-semibold'>{className} {studentid}</h2>
                </div>
                {canEdit && !editMode && (
                    <Button variant="outlined" startIcon={<EditRounded />} onClick={startEdit}>
                        Edit Profile
                    </Button>
                )}
                {editMode && (
                    <div className="flex gap-2">
                        <Button
                            variant="contained"
                            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            Save
                        </Button>
                        <Button variant="outlined" startIcon={<Cancel />} onClick={cancelEdit} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {editMode ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <table className='table-fixed border-collapse w-full'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRowEditable title="English Name" {...register("englishName", { required: true })} />
                            <DataRowEditable title="Chinese Name" {...register("chineseName", { required: true })} />
                            <DataRowEditable title="Gender (Male or Female)" {...register("gender", { required: true })} />
                            <DataRowEditable title="Class" {...register("class", { required: true })} />
                            <DataRowEditable title="Student ID" {...register("studentid", { required: true })} disabled />
                            <DataRowEditable title="Identification Card/Passport" {...register("identification")} />
                            <DataRowEditable title="Phone" {...register("phone")} />
                            <DataRowEditable title="Facebook URL" {...register("facebookURL")} />
                            <DataRowEditable title="Active Email" {...register("email")} />
                            <DataRowEditable title="Address" {...register("address")} />
                            <DataRowEditable title="Birthday" {...register("birthday")} />
                            <DataRowEditable title="Committee Role" {...register("committeeRole")} />
                            <DataRowEditable title="Enrollment Date (yyyy-mm-dd)" {...register("enrollmentDate", { required: true })} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                    <table className='table-fixed border-collapse w-full'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRowEditable title="Mother's Name" {...register("motherName")} />
                            <DataRowEditable title="Mother's Phone" {...register("motherPhone")} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                    <table className='table-fixed border-collapse w-full'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRowEditable title="Father's Name" {...register("fatherName")} />
                            <DataRowEditable title="Father's Phone" {...register("fatherPhone")} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                    <table className='table-fixed border-collapse w-full'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRowEditable title="Emergency Phone" {...register("emergencyphone")} />
                            <DataRowEditable title="Emergency Contact Relation" {...register("emergencyrelation")} />
                            <DataRowEditable title="Specials" {...register("specials")} />
                        </tbody>
                    </table>
                </form>
            ) : (
                <>
                    <table className='table-fixed border-collapse'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRow title="Gender" info={gender} />
                            <DataRow title="Identification Card/Passport" info={identification!} />
                            <DataRow title="Phone" info={phone!} />
                            <DataRow title="Facebook URL" info={facebookURL!} />
                            <DataRow title="Active Email" info={email!} />
                            <DataRow title="Address" info={address!} />
                            <DataRow title="Birthday" info={birthday!} />
                            <DataRow title="Role" info={committeeRole!} />
                            <DataRow title="Enrollment Date" info={enrollmentDate}/>
                            <DataRow title="Enrollment Status" info={status} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                    <table className='table-fixed border-collapse'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRow title="Mother's Name" info={motherName!} />
                            <DataRow title="Mother's Phone" info={motherPhone!} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                    <table className='table-fixed border-collapse'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRow title="Father's Name" info={fatherName!} />
                            <DataRow title="Father's Phone" info={fatherPhone!} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                    <table className='table-fixed border-collapse'>
                        <tbody className='divide-y divide-solid divide-gray-300'>
                            <DataRow title="Emergency Phone" info={emergencyphone!} />
                            <DataRow title="Emergency Contact Relation (Parent/Guardian)" info={emergencyrelation!} />
                            <DataRow title="Specials" info={specials!} />
                        </tbody>
                    </table>
                    <h2 className="text-xl font-medium py-2 text-blue-800">Metadata</h2>
                </>
            )}
        </div>}
    </>
}

export default FullUserProfile;
