import supabaseClient from "./storageClient.js";

const BUCKET_NAME = 'studio-images'

export const uploadFile = async (folderId, fileName, fileBuffer, mimeType) => {
  const path = `folders/${folderId}/${fileName}`
  
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(path, fileBuffer, {
    contentType: mimeType,
    upsert: false
  })
  
  return { data, error, path }
}

export const deleteFile = async (storagePath) => {
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).remove([storagePath])
  
  return { data, error }
}

export const deleteFolder = async (folderId) => {
  const folderPath = `folders/${folderId}`
  
  const { data: files, error: listError } = await supabaseClient.storage.from(BUCKET_NAME).list(folderPath)
  
  if (listError) {
    return { error: listError }
  }
  
  if (!files || files.length === 0) {
    return
  }
  
  const filesToRemove = files.map((file) => `${folderPath}/${file.name}`)
  
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).remove(filesToRemove)
  
  return { data, error }
}

export const getSignedUrl = async (storagePath) => {
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).createSignedUrl(storagePath, 60)
  
  return { signedUrl: data?.signedUrl, error }
}