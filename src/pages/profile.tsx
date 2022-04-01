import { EditRounded } from '@mui/icons-material';
import {LinearProgress, Button} from '@mui/material';
import MemberLayout from '../components/MemberLayout';
import Page from '../components/Page';
import { useAuth } from '../hooks/useAuth';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/router';
import FullUserProfile from '../components/FullUserProfile';

const Profile = () => {
    const { userDetails } = useAuth();
    return <MemberLayout>
        <Page title="Profile">
            <FullUserProfile userDetails={userDetails} isUser={true}/>
        </Page>
    </MemberLayout>
}

export default Profile;