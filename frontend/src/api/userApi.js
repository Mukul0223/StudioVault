import axios from 'axios'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/user`,
})

export const unlockFolder = async (password) => {
  const response = await API.post('/unlock', { password })
  return response.data
}

export const getFolderImages = async (folderId) => {
  const response = await API.get(`/folders/${folderId}/images`)
  return response.data
}

export const getDownloadUrl = async (imageId) => {
  const response = await API.get(`/images/${imageId}/download`)
  return response.data
}