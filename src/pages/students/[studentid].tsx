import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import {useAuth} from '../../hooks/useAuth';
import FullUserProfile from '../../components/FullUserProfile';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { doc } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
const StudentProfile = () => {
    const router = useRouter();
    const [studentDetails, loading, error] = useDocumentData(doc(db, 'students/' + router.query.studentid).withConverter(docConverter));
    return <MemberLayout>
        <Page title={`${studentDetails?.englishName}'s Profile`}>
            <FullUserProfile userDetails={studentDetails}/>
        </Page>
    </MemberLayout>
}

export default StudentProfile;