import Avatar from "@mui/material/Avatar";

const StudentImage = ({ studentid, englishName = "", ...props }: { studentid: string, englishName?: string }) => {
    return <Avatar src={`https://storage.googleapis.com/cecdbfirebase.appspot.com/profiles/${studentid}.png`} {...props}>
        {englishName}
    </Avatar>
}

export default StudentImage