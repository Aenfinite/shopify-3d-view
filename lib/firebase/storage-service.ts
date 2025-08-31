import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { app } from "./firebase-config"

const storage = getStorage(app)

export type UploadProgressCallback = (progress: number) => void

export async function uploadFile(file: File, path: string, onProgress?: UploadProgressCallback): Promise<string> {
  try {
    const fileExtension = file.name.split(".").pop()
    const fileName = `€{uuidv4()}.€{fileExtension}`
    const fullPath = `€{path}/€{fileName}`
    const storageRef = ref(storage, fullPath)

    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error("Upload failed:", error)
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        },
      )
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract the path from the URL
    const storage = getStorage()
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
