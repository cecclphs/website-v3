import { Avatar, Chip } from '@mui/material';
import {ShortStudentInfo} from '../types/User';
import StudentImage from './StudentImage';
const StudentDetailsChip = ({ student }: { student: ShortStudentInfo }) => {
    if(!student) return <></>
    return <Chip avatar={<StudentImage studentid={student.studentid}/>} label={`${student.englishName} ${student.studentid}`} variant="outlined"/>
}
export default StudentDetailsChip;