import {DocumentReference, Timestamp} from 'firebase/firestore';
import {ShortStudentInfo} from './User';

export interface AttendanceRecord {
    id: string,
    ref: DocumentReference,
    recordName: string,
    recordType: string,
    createdBy: ShortStudentInfo,
    createdOn: Timestamp,
    updatedOn: Timestamp
    students: {[studentid: number]: string}
}
