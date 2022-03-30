import {Timestamp, DocumentReference} from 'firebase/firestore';
import {ShortStudentInfo} from './User';

export type FacilityForm = {
    title: string,
    facility: '3dprinter' | 'lasercutter'
    instructions: string,
    agree: boolean,
    selfFab: boolean,
    file: FileList
}

export type FacilityOrderData = {
    id: string,
    ref: DocumentReference;
    title: string,
    facility: '3dprinter' | 'lasercutter',
    instructions: string,
    selfFab: boolean,
    files: { filename: string, url: string, filesize: number }[],
    status: 'pending' | 'accepted' | 'rejected' | 'fabricating' | 'cancelled' | 'completed' | 'paid',
    price?: number,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    requestedBy: ShortStudentInfo,
    checkedBy?: ShortStudentInfo,
    assignedTo?: ShortStudentInfo,
}

