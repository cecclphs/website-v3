import {DocumentReference, Timestamp} from 'firebase/firestore';
import {ShortStudentInfo} from './User';

export type AttendanceValue = '1'|'0'|'迟'|'特'|'事'|'公'

export interface AttendanceRecord {
    id: string,
    ref: DocumentReference,
    recordName: string,
    recordType: string,
    startTimestamp?: Timestamp,
    endTimestamp?: Timestamp,
    notes?: string,
    metadata?: {
        createdBy?: ShortStudentInfo,
        createdOn?: Timestamp,
    }
    updatedOn: Timestamp
    students: {[studentid: string]: AttendanceValue}
}
