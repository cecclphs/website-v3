import {DocumentReference, Timestamp} from 'firebase/firestore';
import {ShortStudentInfo} from './User';
import { CardRecord } from './Cards';

export type AttendanceValue = '1'|'0'|'迟'|'特'|'事'|'公'

export type CardScannedRecord = {
    scannedOn: Timestamp,
    studentid: string,
    type: 'in' | 'out',
} & CardRecord

export type AttendanceRecord = {
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
