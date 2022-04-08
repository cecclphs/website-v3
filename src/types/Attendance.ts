import {DocumentReference, Timestamp} from 'firebase/firestore';
import {ShortStudentInfo} from './User';

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
    students: {[studentid: number]: string}
}
