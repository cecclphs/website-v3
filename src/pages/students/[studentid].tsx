import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import {useAuth} from '../../hooks/useAuth';
import FullUserProfile from '../../components/FullUserProfile';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import { doc, onSnapshot, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db, docConverter } from '../../config/firebase';
import { Button, Checkbox, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, CircularProgress, Container, Alert, Skeleton } from '@mui/material';
import UserToken from '../../types/UserToken';
import StudentDetails from '../../types/StudentDetails';
import { useEffect, useState } from 'react';
import { useDialog } from '../../hooks/useDialog';
import LinkAccountDialog from '../../components/LinkAccountDialog';
import { useSnackbar } from 'notistack';
const StudentProfile = () => {
    const { userToken } = useAuth();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [studentid, setStudentid] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    // Wait for router to be ready before accessing query params
    useEffect(() => {
        if (router.isReady && router.query.studentid) {
            setStudentid(router.query.studentid as string);
        }
    }, [router.isReady, router.query.studentid]);

    const [studentDetails, loading, dbError] = useDocumentData<StudentDetails>(
        studentid ? doc(db, 'students', studentid).withConverter(docConverter) : null
    );
    const [studentPerm, setStudentPerm] = useState<UserToken>({
        studentid: '',
        englishName: '',
        chineseName: '',
        isAdmin: false,
        isCommittee: false,
        isStudent: false,
    });
    const noAccounts = !studentDetails?.linkedAccounts || studentDetails?.linkedAccounts.length === 0 || !studentPerm;
    const [openDialog, closeDialog] = useDialog();

    // Subscribe to permission changes - must be before early returns (Rules of Hooks)
    useEffect(() => {
        if (!router.isReady || loading || !studentDetails?.linkedAccounts?.length) {
            return;
        }

        const firstAcc = studentDetails.linkedAccounts[0];
        const unsubscribe = onSnapshot(
            doc(db, 'user_claims', firstAcc),
            (snapshot) => {
                setStudentPerm(snapshot.data() as UserToken);
            },
            (error) => {
                console.error('Error loading permissions:', error);
            }
        );

        return () => unsubscribe();
    }, [studentDetails?.linkedAccounts, loading, router.isReady]);

    // Early returns for loading and error states
    if (!router.isReady || !studentid) {
        return (
            <MemberLayout>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <CircularProgress />
                </Container>
            </MemberLayout>
        );
    }

    if (loading) {
        return (
            <MemberLayout>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Skeleton variant="rectangular" height={400} />
                </Container>
            </MemberLayout>
        );
    }

    if (dbError || !studentDetails) {
        return (
            <MemberLayout>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error">Failed to load student details</Alert>
                </Container>
            </MemberLayout>
        );
    }

    const setStatus = async (status: StudentDetails['status']) => {
        if (!router.isReady || !studentid || !studentDetails || updating) {
            return;
        }

        setUpdating(true);

        try {
            await updateDoc(doc(db, `students/${studentid}`), {
                status,
                modifiedOn: serverTimestamp()
            });

            enqueueSnackbar(`Status updated to ${status}`, { variant: 'success' });
        } catch (error) {
            console.error('Update status error:', error);
            enqueueSnackbar('Failed to update status', { variant: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const setPerm = async (perm: keyof Omit<UserToken, '_lastCommitted'>, enabled: boolean) => {
        if (!studentDetails?.linkedAccounts?.length || updating) {
            enqueueSnackbar('No linked accounts found', { variant: 'warning' });
            return;
        }

        setUpdating(true);

        try {
            await Promise.all(
                studentDetails.linkedAccounts.map(account =>
                    updateDoc(doc(db, `user_claims/${account}`), {
                        [perm]: enabled,
                        _lastCommitted: serverTimestamp()
                    })
                )
            );

            enqueueSnackbar(
                `Permission ${perm} ${enabled ? 'granted' : 'revoked'}`,
                { variant: 'success' }
            );
        } catch (error) {
            console.error('Update permission error:', error);
            enqueueSnackbar('Failed to update permissions', { variant: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const handleLinkAccount = () => {
        openDialog({
            children: <LinkAccountDialog onClose={closeDialog} studentid={studentid}/>
        })
    }

    return <MemberLayout>
        <Page title={`${studentDetails?.englishName || "Member"}'s Profile`}>
            <div className="flex flex-col sm:flex-row gap-4 overflow-hidden">
                <div className="flex flex-col flex-1">
                {noAccounts?<div className='flex flex-col'>
                    <h3 className="font-semibold text-lg">User has no accounts linked</h3>
                </div>:<div className='flex flex-col'>
                    <h3 className="font-semibold text-lg">User Permissions</h3>
                    <p className="text-sm text-gray-600">{studentDetails.linkedAccounts.length} Account(s)</p>
                    <FormControlLabel control={<Checkbox checked={studentPerm.isAdmin} onChange={e => setPerm('isAdmin',e.target.checked)} disabled={updating}/>} label="Admin Priviliges" />
                    <FormControlLabel control={<Checkbox checked={studentPerm.isCommittee} onChange={e => setPerm('isCommittee',e.target.checked)} disabled={updating}/>} label="Committee Priviliges" />
                    </div>}
                    <Button variant="contained" color="primary" onClick={handleLinkAccount} size="small" sx={{ alignSelf: 'flex-start', mt: 1 }}>Link An Account</Button>
                </div>
                <FormControl size="small" margin='normal' disabled={updating} sx={{ minWidth: 180, maxWidth: { xs: '100%', sm: 200 } }}>
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