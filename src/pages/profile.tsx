import { EditRounded } from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import MemberLayout from '../components/MemberLayout';
import Page from '../components/Page';
import { useAuth } from '../hooks/useAuth';

const DataRow = ({title, info}: {title: string, info: string}) => {
    return <tr>
        <td className='text-sm font-semibold py-2 w-[200px]'>{title}</td>
        <td>{info}</td>
    </tr>
}

const Profile = () => {
    const { user, userDetails } = useAuth();
    const isLoading = !userDetails;
    const {
        englishName,
        chineseName,
        class: className,
        studentid,
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
    return <MemberLayout>
        <Page title="Profile">
            {isLoading?<div className="grid place-items-center">
                <LinearProgress />
            </div>:
            <div className="flex flex-col">
                <div className='flex flex-row space-x-3 items-center'>
                    <div className='relative w-20 h-20'>
                        <div className='w-20 h-20 absolute grid place-items-center left-0 top-0 transition opacity-0 bg-black/30 hover:opacity-100 rounded-full cursor-pointer'>
                            <EditRounded className="text-white"/>
                        </div>
                        <img src={user?.photoURL} className="w-20 h-20 rounded-full object-cover border-[6px] border-solid border-white shadow-xl" alt="User Profile"/>
                    </div>
                    <div className="flex flex-col">
                        <h1 className='text-2xl font-semibold'>{chineseName} {englishName}</h1>
                        <h2 className='font-semibold'>{className} {studentid}</h2>
                    </div>
                </div>
                <table className='table-fixed border-collapse'>
                    <tbody className='divide-y divide-solid divide-gray-300'>
                        <DataRow title="Identification Card/Passport" info={identification!} />
                        <DataRow title="Phone" info={phone!} />
                        <DataRow title="Facebook URL" info={facebookURL!} />
                        <DataRow title="Active Email" info={email!} />
                        <DataRow title="Address" info={address!} />
                        <DataRow title="Birthday" info={birthday!} />
                        <DataRow title="Role" info={committeeRole!} />
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
                {/* <DataRow title="Created On" info={createdOn.toDate().toDateString()} />
                <DataRow title="Modified On" info={modifiedOn.toDate().toDateString()} /> */}

            </div>}
        </Page>
    </MemberLayout>
}

export default Profile;