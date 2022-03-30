import UUID from "uuid-v4";
import { adminStorage } from '../../config/firebase-admin';

async function UploadFile(fileBuffer: Buffer, destFilePath: string) {
    let uuid = UUID()
    let storageUpload = await adminStorage.file(destFilePath).save(fileBuffer, {
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuid
            }
        }
    })
    let file = storageUpload[0]
    return "https://firebasestorage.googleapis.com/v0/b/" + 'cecdbfirebase.appspot.com' + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
}

async function UploadPublicFile(fileBuffer: Buffer, destFilePath: string) {
    let uuid = UUID()
    let storageUpload = await adminStorage.file(destFilePath).save(fileBuffer, {
        metadata: {
            cacheControl: 'public, max-age=300',
            firebaseStorageDownloadTokens: uuid
        }
    })
    await adminStorage.file(destFilePath).makePublic()
    return `https://storage.googleapis.com/cecdbfirebase.appspot.com/${destFilePath}`
}

export { UploadFile, UploadPublicFile }
