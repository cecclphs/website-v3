import Head from "next/head";
import React, { useEffect, useState } from "react";
import MemberLayout from "../components/MemberLayout";
import { fetchAPI } from "../utils/fetchAPI";
import { useAuth } from "../hooks/useAuth";
import { AttendanceValue } from "../types/Attendance";
import { CircularProgress, Paper } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

const Dashboard = () => {
  const { user } = useAuth();
  const [studentAttendance, setStudentAttendance] = useState<{
    [date: string]: AttendanceValue;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const attendance = await fetchAPI("/user/get_attendance", user);
      setStudentAttendance(attendance.data);
      setLoading(false);
    })();
  }, [user]);
  return (
    <MemberLayout>
      <div className="p-3 sm:p-6">
        <Head>
          <title>Creative Electronics Club - Dashboard</title>
        </Head>
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Attendance</h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress />
            </div>
          ) : Object.keys(studentAttendance).length === 0 ? (
            <Paper className="p-8 text-center text-gray-500">
              No attendance records found
            </Paper>
          ) : (
            <Paper elevation={2} className="overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[320px]">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.keys(studentAttendance)
                    .sort(
                      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
                    )
                    .map((key) => {
                      const isPresent = studentAttendance[key] !== "0";
                      return (
                        <tr
                          key={key}
                          className={`transition-colors hover:bg-gray-50 ${isPresent ? "" : "bg-red-50"}`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {new Date(key).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            {isPresent ? (
                              <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-green-600">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-xs sm:text-sm font-semibold">
                                  Present
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-red-600">
                                <Cancel className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-xs sm:text-sm font-semibold">
                                  Absent
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </Paper>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default Dashboard;
