import UUID from "uuid-v4";
import { adminStorage } from '../../config/firebase-admin';

async function UploadFile(localFilePath, destFilePath) {
    let uuid = UUID()
    let storageUpload = await adminStorage.upload(localFilePath, {
        destination: destFilePath,
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuid
            }
        }
    })
    let file = storageUpload[0]
    return "https://firebasestorage.googleapis.com/v0/b/" + 'cecdbfirebase.appspot.com' + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
}

async function UploadPublicFile(localFilePath, destFilePath) {
    let uuid = UUID()
    let storageUpload = await adminStorage.upload(localFilePath, {
        destination: destFilePath,
        metadata: {
            cacheControl: 'public, max-age=300',
            metadata: {
                firebaseStorageDownloadTokens: uuid
            }
        }
    })
    await storageUpload[0].makePublic()
    return `https://storage.googleapis.com/cecdbfirebase.appspot.com/${destFilePath}`
}

export { UploadFile, UploadPublicFile }
