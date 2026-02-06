import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import MemberLayout from '../components/MemberLayout';
import { fetchAPI } from '../utils/fetchAPI';
import { useAuth } from '../hooks/useAuth';
import {AttendanceValue} from '../types/Attendance';

const Dashboard = () => {
    const { user } = useAuth();
    const [studentAttendance, setStudentAttendance] = useState<{[date: string]: AttendanceValue}>({});

    useEffect(() => {
        if(!user) return;
        (async () => {
            const attendance = await fetchAPI('/user/get_attendance', user)
            setStudentAttendance(attendance.data)
        })()
    }, [user])
    return (
        <MemberLayout>
            <div className="p-4">
                <Head>
                    <title>Creative Electronics Club</title>
                </Head>
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-bold">Your Attendance</h1>
                    <div className="overflow-x-auto -mx-4 px-4 mt-2">
                        <table className="table-auto border-collapse border border-neutral-400 w-full min-w-[320px]">
                            <thead>
                                <tr>
                                    <td className="px-2 sm:px-4 py-2 border border-neutral-400 text-sm sm:text-base">Date</td>
                                    <td className="px-2 sm:px-4 py-2 border border-neutral-400 text-center text-sm sm:text-base">Attendance</td>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(studentAttendance).map((key) => <tr key={key} className={studentAttendance[key] === '0' ? 'bg-red-300' : ''}>
                                    <td className="px-2 sm:px-4 py-2 border border-neutral-400 text-sm sm:text-base">{key}</td>
                                    <td className="px-2 sm:px-4 py-2 border border-neutral-400 text-center text-sm sm:text-base">{studentAttendance[key]}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
}

export default Dashboard;
