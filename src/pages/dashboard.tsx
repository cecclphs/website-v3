import Head from 'next/head';
import React, { useEffect } from 'react';
import MemberLayout from '../components/MemberLayout';
import { fetchAPI } from '../utils/fetchAPI';
import { useAuth } from '../hooks/useAuth';
const Dashboard = () => {
    const { user } = useAuth();
    useEffect(() => {
        if(!user) return;
        (async () => {
            const attendance = await fetchAPI('/user/get_attendance', user)
            console.log(attendance)
        })()
    }, [user])
    return (
        <MemberLayout>
            <Head>
                <title>Creative Electronics Club</title>
            </Head>
        </MemberLayout>
    );
}

export default Dashboard;
