import { useEffect, useState } from "react";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { useAuth } from "../../hooks/useAuth";
import StudentDetails from "../../types/StudentDetails";
import {fetchAPI} from '../../utils/fetchAPI';
import { DataGrid } from '@mui/x-data-grid';
import { TextField } from "@mui/material";


const NewAttendance = () => {
    const { user } = useAuth();
    const [eventName, setEventName] = useState("");

    return <MemberLayout>
        <Page title="New Attendance">
            <TextField
                label="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
            />

        </Page>
    </MemberLayout>
}

export default NewAttendance;