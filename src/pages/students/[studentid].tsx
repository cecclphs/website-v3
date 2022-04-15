import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import {useAuth} from '../../hooks/useAuth';
import FullUserProfile from '../../components/FullUserProfile';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@mui/material';
import UserToken from '../../types/UserToken';
import StudentDetails from '../../types/StudentDetails';
import { useEffect, useState } from 'react';
const StudentProfile = () => {
    const { userToken } = useAuth();
    const router = useRouter();
    const [studentDetails, loading, error] = useDocumentData<StudentDetails>(doc(db, 'students/' + router.query.studentid).withConverter(docConverter));
    const [studentPerm, setStudentPerm] = useState<UserToken>({
        studentid: '',
        englishName: '',
        chineseName: '',
        isAdmin: false,
        isCommittee: false,
        isStudent: false,
    });
    const noAccounts = !studentDetails?.linkedAccounts || studentDetails?.linkedAccounts.length === 0 || !studentPerm;
    useEffect(() => {
        (async () => {
            if (!loading && studentDetails.linkedAccounts?.length > 0) {;
                const firstAcc = studentDetails.linkedAccounts[0];
                return onSnapshot(doc(db, 'user_claims', firstAcc), (snapshot) => {
                    setStudentPerm(snapshot.data() as UserToken);
                });
            }
        })();
    },[studentDetails, loading, router.query.studentid])

    const setPerm = (perm: keyof Omit<UserToken, 'englishName' | 'chineseName' | 'studentid'>, enabled: boolean) => {
        if(!studentDetails.linkedAccounts) return;
        studentDetails.linkedAccounts.forEach(account => {
            updateDoc(doc(db, `user_claims/${account}`), {
                [perm]: enabled
            })
        })
    }

    const setStatus = (status: StudentDetails['status']) => {
        updateDoc(doc(db, `students/${router.query.studentid}`), {
            status
        })
    }

    return <MemberLayout>
        <Page title={`${studentDetails?.englishName || "Member"}'s Profile`}>
            <div className="flex flex-row overflow-hidden">
                {noAccounts?<div className='flex flex-col'>
                    <h3 className="font-semibold text-lg">User has no accounts linked</h3>
                </div>:<div className='flex flex-col'>
                    <h3 className="font-semibold text-lg">User Permissions</h3>
                    <FormControlLabel control={<Checkbox defaultChecked checked={studentPerm.isAdmin} onChange={e => setPerm('isAdmin',e.target.checked)}/>} label="Admin Priviliges" />
                    <FormControlLabel control={<Checkbox defaultChecked checked={studentPerm.isCommittee} onChange={e => setPerm('isCommittee',e.target.checked)}/>} label="Committee Priviliges" />
                </div>}
                <FormControl fullWidth size="small" margin='normal'>
                    <InputLabel id="status-label">Enrollment Status</InputLabel>
                    <Select
                        labelId="status-label"
                        label="Enrollment Status"
                        value={studentDetails?.status || ""}
                        size="small"
                        onChange={e => setStatus(e.target.value as StudentDetails['status'])}>
                        <MenuItem value="enrolled">Enrolled</MenuItem>
                        <MenuItem value="graduated">Graduated</MenuItem> 
                        <MenuItem value="transfered">Transfered</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <FullUserProfile userDetails={studentDetails}/>
        </Page>
    </MemberLayout>
}

export default StudentProfile;