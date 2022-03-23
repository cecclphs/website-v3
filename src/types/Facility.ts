import { Timestamp } from "firebase/firestore"

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
    title: string,
    facility: '3dprinter' | 'lasercutter',
    instructions: string,
    selfFab: boolean,
    file: { filename: string, url: string, filesize: number }[],
    status: 'pending' | 'accepted' | 'rejected' | 'fabricating' | 'cancelled' | 'completed' | 'paid',
    price?: number,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    requestedBy: {
        studentid: string,
        englishName: string,
    },
    checkedBy?: {
        studentid: string,
        englishName: string,
    },
    assignedTo?: {
        studentid: string,
        englishName: string,
    },
}

