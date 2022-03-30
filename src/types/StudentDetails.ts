import { DocumentReference } from "firebase/firestore";

export default interface StudentDetails {
    id: string,
    ref: DocumentReference
    englishName: string,
    chineseName: string,
    studentid: string,
    identification: string,
    phone: string,
    facebookURL: string,
    email: string,
    address: string,
    birthday: string,
    class: string,
    motherName: string,
    motherPhone: string,
    fatherName: string,
    fatherPhone: string,
    emergencyphone: string,
    emergencyrelation: string,
    specials: string,
    committeeRole: string,
    linkedAccounts: string[],
    photoURL: string,
}
