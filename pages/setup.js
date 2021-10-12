import { httpsCallable } from "@firebase/functions";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import SlideTransition from "../components/SlideTransition/SlideTransition";
import { functions } from "../config/firebase";

const Paper = ({className, children}) => (
    <SlideTransition in timeout={50}>
        <div className={`bg-white opacity-85 shadow-lg border rounded-xl p-6 m-4 ${className}`}>
            {children}
        </div>
    </SlideTransition>
)

const DataRow = ({ title, info}) => ( 
    <div className="py-1">
        <h5 className="text-sm font-bold text-gray-600">{title}</h5>
        <p className="text-base">{info}</p>
    </div>
)

const MigrateUser = () => {
    const [oldUserData, setOldUserData] = useState({});
    useEffect(() => {
        const migrateUser = async () => {
            try {
                const response = await httpsCallable(functions,'getOldUserData')()
                console.log(response.data)
                setOldUserData(response.data)
            } catch (e) {
                console.log(e)
            }
        }
        migrateUser();
    }, []);

    return <Paper className="max-w-[500px] space-y-2 text-center">
        <h1 className="text-2xl font-bold">Migrate User</h1>
        <h3 className="text-lg text-gray-500">We've found that you have a existing account on the old site, Please to see if we have your details correct.</h3>
        {oldUserData && <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-200 text-left scrollbar scrollbar-thumb-blue-100 hover:scrollbar-thumb-blue-200 scrollbar-track-gray-100 " >
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
            <DataRow title="Created On" info={new Date(oldUserData.createdOn?._seconds*1000).toDateString()} />
            <DataRow title="Modified On" info={new Date(oldUserData.modifiedOn?._seconds*1000).toDateString()} />
        </div>}
        <div className="space-x-2 float-right mt-4">
            <Button variant="contained" color="error" size="medium">Edit</Button>
            <Button variant="contained" color="info" size="medium">Continue</Button>
        </div>
    </Paper>
}

const Setup = () => {
    return (
        <div className="w-screen h-screen background">
            <div className="w-full h-full grid place-items-center">
                <MigrateUser />
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
