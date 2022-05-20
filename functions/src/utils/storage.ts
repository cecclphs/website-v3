//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../admin';

async function UploadFile(fileBuffer: Buffer, destFilePath: string) {
    let uuid = uuidv4()
    await storage.file(destFilePath).save(fileBuffer, {
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuid
            }
        }
    })
    return "https://firebasestorage.googleapis.com/v0/b/" + 'cecdbfirebase.appspot.com' + "/o/" + encodeURIComponent(destFilePath) + "?alt=media&token=" + uuid
}

async function UploadPublicFile(fileBuffer: Buffer, destFilePath: string) {
    let uuid = uuidv4()
    await storage.file(destFilePath).save(fileBuffer, {
        metadata: {
            cacheControl: 'public, max-age=300',
            firebaseStorageDownloadTokens: uuid
        }
    })
    await storage.file(destFilePath).makePublic()
    return `https://storage.googleapis.com/cecdbfirebase.appspot.com/${destFilePath}`
}

export { UploadFile, UploadPublicFile }
