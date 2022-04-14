import { httpsCallable } from "@firebase/functions";
import Head from 'next/head'
import { Button, LinearProgress } from "@mui/material";
import { forwardRef, useEffect, useState, PropsWithChildren, PropsWithoutRef } from "react";
import SlideTransition from "../components/SlideTransition/SlideTransition";
import { functions } from "../config/firebase";
import { Ref, useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/dist/client/router";
import { Timestamp } from "firebase/firestore";
import StudentDetails from "../types/StudentDetails";
import SerializedTimestamp from "../types/SerializedTimestamp";
import {fetchAPI} from '../utils/fetchAPI';
import { useSnackbar } from "notistack";




interface StudentData extends StudentDetails {
    createdOn: Timestamp,
    modifiedOn: Timestamp,
}

const Paper = ({className, children}: PropsWithChildren<{ className: string }> ) => (
    <SlideTransition in timeout={50}>
        <div className={`bg-white opacity-85 shadow-lg border rounded-xl p-6 m-4 ${className}`}>
            {children}
        </div>
    </SlideTransition>
)

const DataRow = ({ title, info}: PropsWithoutRef<{title:string, info: string}>) => ( 
    <div className="py-1">
        <h5 className="text-sm font-semibold text-gray-500">{title}</h5>
        <p className="text-base">{info}</p>
    </div>
)
//TODO: proper types for this function
//@ts-ignore
const DataRowInput = forwardRef(({title, info, ...props}: PropsWithChildren<{title: string, info?: string}>, ref: Ref<any>) => (
    <div className="py-1">
        <h5 className="text-xs font-semibold text-gray-500">{title}</h5>
        <input ref={ref} className="text-base appearance-none w-full border-b border-solid border-indigo-400" defaultValue={info} {...props} />
    </div>
))

const MigrateUser = () => {
    const { user, userDetails } = useAuth();
    const [oldUserData, setOldUserData] = useState<StudentData>();
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<StudentData>({
        mode: 'onChange'
    });
    const onSubmit = (data: StudentData) => console.log(data);

    useEffect(() => {
        const migrateUser = async () => {
            try {
                setLoading(true);
                const response = await fetchAPI('/user/getOldUserData', user, {})
                console.log(response.data)
                const data = response.data;
                setOldUserData({...data, createdOn: new Timestamp(data.createdOn._seconds, data.createdOn._nanoseconds), modifiedOn: new Timestamp(data.modifiedOn._seconds, data.modifiedOn._nanoseconds)})
                setLoading(false)
            } catch (e) {
                console.log(e)
            }
        }
        migrateUser();
    }, [user]);

    const handleEditButton = () => setEditing(true);

    const handleContinue = async () => {
        let newUserData = Object.assign({}, oldUserData);
        if(!user) return;
        await fetchAPI('/user/migrate', user, {
            body: JSON.stringify({
                userDetails: newUserData
            })
        })
    }

    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">Migrate User</h1>
        <h3 className="text-lg text-gray-500">We've found that you have a existing account on the old site, Please to see if we have your details correct.</h3>
        {oldUserData && (!editing ? <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-200 text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 " >
                <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
                <DataRow title="English Name" info={oldUserData.englishName} />
                <DataRow title="Chinese Name" info={oldUserData.chineseName} />
                <DataRow title="Student ID" info={oldUserData.studentid} />
                <DataRow title="Identification Card/Passport" info={oldUserData.identification} />
                <DataRow title="Phone" info={oldUserData.phone} />
                <DataRow title="Facebook URL" info={oldUserData.facebookURL} />
                <DataRow title="Active Email" info={oldUserData.email} />
                <DataRow title="Address" info={oldUserData.address} />
                <DataRow title="Birthday" info={oldUserData.birthday} />
                <DataRow title="Class" info={oldUserData.class} />
                <DataRow title="Role" info={oldUserData.committeeRole} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRow title="Mother's Name" info={oldUserData.motherName} />
                <DataRow title="Mother's Phone" info={oldUserData.motherPhone} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRow title="Father's Name" info={oldUserData.fatherName} />
                <DataRow title="Father's Phone" info={oldUserData.fatherPhone} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRow title="Emergency Phone" info={oldUserData.emergencyphone} />
                <DataRow title="Emergency Contact Relation (Parent/Guardian)" info={oldUserData.emergencyrelation} />
                <DataRow title="Specials" info={oldUserData.specials} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Metadata</h2>
                <DataRow title="Created On" info={oldUserData.createdOn.toDate().toDateString()} />
                <DataRow title="Modified On" info={oldUserData.modifiedOn.toDate().toDateString()} />
            </div>:<form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
                <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
                {/* @ts-ignore */}
                <DataRowInput {...register("englishName", { required: true })} title="English Name" info={oldUserData.englishName} />
                <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name" info={oldUserData.chineseName} />
                <DataRowInput {...register("studentid", { required: true })} title="Student ID" info={oldUserData.studentid} />
                <DataRowInput {...register("identification", { required: true })} title="Identification Card/Passport" info={oldUserData.identification} />
                <DataRowInput {...register("phone", { required: true })} title="Phone" info={oldUserData.phone} />
                <DataRowInput {...register("facebookURL", { required: true })} title="Facebook URL" info={oldUserData.facebookURL} />
                <DataRowInput {...register("email", { required: true })} title="Active Email" info={oldUserData.email} />
                <DataRowInput {...register("address", { required: true })} title="Address" info={oldUserData.address} />
                <DataRowInput {...register("birthday", { required: true })} title="Birthday" info={oldUserData.birthday} />
                <DataRowInput {...register("class", { required: true })} title="Class" info={oldUserData.class} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Mother's Details</h2>
                <DataRowInput {...register("motherName", { required: true })} title="Mother's Name" info={oldUserData.motherName} />
                <DataRowInput {...register("motherPhone", { required: true })} title="Mother's Phone" info={oldUserData.motherPhone} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Father's Details</h2>
                <DataRowInput {...register("fatherName", { required: true })} title="Father's Name" info={oldUserData.fatherName} />
                <DataRowInput {...register("fatherPhone", { required: true })} title="Father's Phone" info={oldUserData.fatherPhone} />
                <h2 className="text-xl font-medium py-2 text-blue-800">Emergency Details</h2>
                <DataRowInput {...register("emergencyphone", { required: true })} title="Emergency Phone" info={oldUserData.emergencyphone} />
                <DataRowInput {...register("emergencyrelation", { required: true })} title="Emergency Contact Relation (Parent/Guardian)" info={oldUserData.emergencyrelation} />
                <DataRowInput {...register("specials", { required: true })} title="Specials" info={oldUserData.specials} />
            </form>)}
        <div className="space-x-2 float-right mt-4">
            {!editing && <Button variant="contained" color="error" size="medium" onClick={handleEditButton}>Edit</Button>}
            <Button disabled={!isValid && editing} variant="contained" color="info" size="medium" onClick={handleSubmit(handleContinue)}>{editing?"Update":"Continue"}</Button>
        </div>
    </Paper>
}
type NewUserForm = {
    englishName: string,
    chineseName: string,
    studentid: string,
    identification: string,
    phone: string,
    facebookURL: string,
    email: string,
    address: string,
    birthday: string,
    class: string,
    motherName: string,
    motherPhone: string,
    fatherName: string,
    fatherPhone: string,
    emergencyphone: string,
    emergencyrelation: string,
    specials: string,
}
const NewUser = () => {
    const { user } = useAuth();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<NewUserForm>();
    const { enqueueSnackbar } = useSnackbar();

    const handleCreate = async (data: NewUserForm) => {
        const res = await fetchAPI("/user/create_user", user, { body: JSON.stringify(data)})
        if (res.status === 200) {
            enqueueSnackbar("Your account has been created", { variant: "success" });
            reset();
        }
    }

    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">New User</h1>
        <h3 className="text-lg text-gray-500">We've detected that you're a student! Welcome aboard</h3>
        <form className="max-h-[70vh] overflow-y-auto text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 ">
            <h2 className="text-xl font-medium py-2 text-blue-800">Personal Details</h2>
            <DataRowInput {...register("englishName", { required: true })} title="English Name"/>
            <DataRowInput {...register("chineseName", { required: true })} title="Chinese Name"/>
            <DataRowInput {...register("studentid", { required: true })} title="Student ID"/>
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
            <DataRowInput {...register("specials", { required: true })} title="Specials"/>
        </form>
        <div className="space-x-2 float-right mt-4">
            <Button variant="contained" color="info" size="medium" onClick={handleSubmit(handleCreate)}>{"Submit"}</Button>
        </div>
    </Paper>
}

const LoadingPage = () => {
    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">Loading Setup</h1>
        <h3 className="text-lg text-gray-500">Checking if you're worthy of the site</h3>
        <LinearProgress/>
    </Paper>
}

const DeniedPage = () => {
    const { user } = useAuth();
    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <h3 className="text-lg text-gray-500">You're account {user.email} is not eligible for setup. Please contact a committee member for help.</h3>
    </Paper>
}



const SetupComplete = () => {
    const { refreshUserToken } = useAuth();
    const router  = useRouter();
    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">Setup Complete</h1>
        <h3 className="text-lg text-gray-500">Welcome aboard fellow comrade, to the new and improved CEC Site</h3>
        <button 
            className="bg-indigo-500 hover:bg-indigo-600 transition shadow-lg text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
            onClick={async ()=>{
                await refreshUserToken();
                router.push("/dashboard");
            }}>
                Go to Home
        </button>
    </Paper>
}

const Setup = () => {
    const { user, userDetails } = useAuth();
    const [activeSetup, setActiveSetup] = useState<'loading' | 'migrate' | 'newUser' | 'completed' | 'denied'>('loading');

    //View Controller
    useEffect(() => {
        /*# Senarios
        - Existing User with from old website
            will have existing userDetails, migrated will be null or false
            -> Navigate to Migrated
        - New User with School Account (with old account)
            will not have existing userDetails, but is able to access migrate api
        - New User with School Account (no old account)
            will not have existing userDetails, and does not have access to migrate api
            but has access to create user api
        - New User Only
            will not have existing userDetails, and does not have access to migrate api
            and does not have access to create user api
            deny access to setup
        */
        if(!user) return;
        const isSchoolEmail = /(s[0-9]{5}@clphs.edu.my)/g.test(user.email);
        (async () => {
            if(userDetails && userDetails.migrated) setActiveSetup('completed');
            else if((userDetails && !userDetails.migrated) || (await fetchAPI('/user/getOldUserData', user, {}) && isSchoolEmail)) {
                setActiveSetup('migrate');
            }
            else if(isSchoolEmail) setActiveSetup('newUser');
            else setActiveSetup('denied');
        })()
    }, [userDetails, user]);

    return (
        <div className="w-screen h-screen background">
            <Head>
                <title>Setup</title>
            </Head>
            <div className="w-full h-full grid place-items-center">
                {activeSetup == 'loading' && <LoadingPage />}
                {activeSetup == 'migrate' && <MigrateUser />}
                {activeSetup == 'newUser' && <NewUser />}
                {activeSetup == 'denied' && <DeniedPage />}
                {activeSetup == 'completed' && <SetupComplete />}
            </div>
            <style jsx>{`
                .background {
                    background-size: 100%;
                    background-image: radial-gradient(circle   at  85% 100%, #fff 20%, rgba(255, 255, 255, 0)), radial-gradient(80%  80% at  15% 100%, rgba(255, 170, 0, 0.1) 25%, rgba(255, 0, 170, 0.1) 50%, rgba(255, 0, 170, 0) 100%), linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)), radial-gradient(60% 180% at 100%  15%, rgba(0, 255, 170, 0.3) 25%, rgba(0, 170, 255, 0.2) 50%, rgba(0, 170, 255, 0) 100%), linear-gradient(hsla(256, 100%, 50%, 0.2), hsla(256, 100%, 50%, 0.2))
                }
            `}</style>
        </div>
    );
}

export default Setup;
