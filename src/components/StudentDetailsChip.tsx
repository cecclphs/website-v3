import { Avatar, Chip } from '@mui/material';
import {ShortStudentInfo} from '../types/User';
const StudentDetailsChip = ({ student }: { student: ShortStudentInfo }) => {
    if(!student) return <></>
    //TODO: Add a link to the student's profile
    //TODO: Link avatar to actual image
    return <Chip avatar={<Avatar>{student.englishName}</Avatar>} label={`${student.englishName} ${student.studentid}`} variant="outlined"/>
}
export default StudentDetailsChip;