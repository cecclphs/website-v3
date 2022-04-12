import Head from 'next/head';
import React from 'react';
import MemberLayout from '../components/MemberLayout';

const Dashboard = () => {
    return (
        <MemberLayout>
            <Head>
                <title>Creative Electronics Club</title>
            </Head>
        </MemberLayout>
    );
}

export default Dashboard;
