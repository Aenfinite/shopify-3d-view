// Firebase removed — file upload now handled by Supabase storage.
export type UploadProgressCallback = (progress: number) => void

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  throw new Error("File upload not yet implemented with Supabase")
}

export async function deleteFile(url: string): Promise<void> {}
