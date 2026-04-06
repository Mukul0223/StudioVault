import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}`}
})

export const loginAdmin = async (password) => {
  try {
    await axios.get(`${API_URL}/admin/folders`, getAuthHeader(password))
    return password
  } catch (err) {
    throw new Error('Invalid Admin Secret Key', { cause: err })
  }
}

export const getFolders = async (token) => {
  const response = await axios.get(`${API_URL}/admin/folders`, getAuthHeader(token))
  return response.data
}

export const createFolder = async (token, name, password) => {
  const response = await axios.post(`${API_URL}/admin/folders`, { name, password }, getAuthHeader(token))
  return response.data
} 

export const updateFolderPassword = async (token, folderId, newPassword) => {
  const response = await axios.put(
    `${API_URL}/admin/folders/${folderId}/password`,
    { newPassword },
    getAuthHeader(token)
  )
  return response.data
}

export const deleteFolder = async (token, folderId) => {
  const response = await axios.delete(`${API_URL}/admin/folders/${folderId}`, getAuthHeader(token))
  return response.data
}

export const deleteImage = async (token, imageId) => {
  const response = await axios.delete(`${API_URL}/admin/images/${imageId}`, getAuthHeader(token))
  return response.data
}

export const uploadImages = async (token, folderId, files) => {
  const formData = new FormData()
  
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i])
  }
  
  const response = await axios.post(
    `${API_URL}/admin/folders/${folderId}/images`,
    formData,
    {
      headers: {
        ...getAuthHeader(token).headers,
        'Content-Type': 'multipart/form-data'
      },
  })
  return response.data
}