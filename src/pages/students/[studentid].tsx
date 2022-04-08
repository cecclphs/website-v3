import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import {useAuth} from '../../hooks/useAuth';
import FullUserProfile from '../../components/FullUserProfile';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { doc, updateDoc } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
import { Button } from '@mui/material';
import UserToken from '../../types/UserToken';
import StudentDetails from '../../types/StudentDetails';
const StudentProfile = () => {
    const { userToken } = useAuth();
    const router = useRouter();
    const [studentDetails, loading, error] = useDocumentData<StudentDetails>(doc(db, 'students/' + router.query.studentid).withConverter(docConverter));

    const setPerm = (perm: keyof Omit<UserToken, 'englishName' | 'chineseName' | 'studentid'>, enabled: boolean) => {
        if(!studentDetails.linkedAccounts) return;
        studentDetails.linkedAccounts.forEach(account => {
            updateDoc(doc(db, `user_claims/${account}`), {
                [perm]: enabled
            })
        })
    }

    return <MemberLayout>
        <Page title={`${studentDetails?.englishName}'s Profile`}>
            <div className='flex flex-row space-x-2'>
                <Button onClick={() => setPerm('isAdmin', true)}>Make Admin</Button>
                <Button onClick={() => setPerm('isAdmin', false)}>Remove Admin</Button>
                <Button onClick={() => setPerm('isCommittee', true)}>Make Comittee</Button>
                <Button onClick={() => setPerm('isCommittee', false)}>Remove Comittee</Button>
            </div>
            <FullUserProfile userDetails={studentDetails}/>
        </Page>
    </MemberLayout>
}

export default StudentProfile;