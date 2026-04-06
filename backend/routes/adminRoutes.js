import express from 'express'
import bcrypt from 'bcrypt'
import multer from 'multer'
import adminAuth from '../middleware/adminAuth.js'
import * as folderModel from '../models/folderModel.js'
import * as imageModel from '../models/imageModel.js'
import * as storageModel from '../storage/storageModel.js'

const router = express.Router()

// Setup Multer to keep files in RAM (Buffers)
const upload = multer({ storage: multer.memoryStorage() })

// Apply security guard to all routes below this
router.use(adminAuth)

// Create new folders
router.post('/folders', async (req, res) => {
  try {
    const { name, password } = req.body
    const hash = await bcrypt.hash(password, 10)
    const newFolder = await folderModel.createFolder(name, hash)
    res.status(201).json(newFolder)
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

// Get all folders
router.get('/folders', async (req, res) => {
  try {
    const folders = await folderModel.getAllFolders()
    const safeFolders = folders.map(({ passwordHash, ...rest }) => rest)
    res.status(200).json(safeFolders)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

// Update passwords
router.put('/folders/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body
    const newHash = await bcrypt.hash(newPassword, 10)
    await folderModel.updateFolderPassword(req.params.id, newHash)
    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

// Delete folder
router.delete('/folders/:id', async (req, res) => {
  try {
    const folderId = req.params.id
    
    await storageModel.deleteFolder(folderId)
    await folderModel.deleteFolder(folderId)
    res.status(200).json({ message: 'Folder and contents deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

// Upload images
router.post('/folders/:id/images', upload.array('files'), async (req, res) => {
  try {
    const folderId = req.params.id
    const results = []
    
    for (const file of req.files) {
      const { path } = await storageModel.uploadFile(
        folderId,
        file.originalname,
        file.buffer,
        file.mimetype
      )
      
      const newImage = await imageModel.createImage(folderId, file.originalname, path)
      results.push(newImage)
    }
    res.status(201).json(results)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}) 

// Delete a image
router.delete('/images/:id', async (req, res) => {
  try {
    const imageId = req.params.id
    const image = await imageModel.getImageById(imageId)
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }
    
    await storageModel.deleteFile(image.storagePath)
    await imageModel.deleteImage(imageId)
    
    res.status(200).json({ message: 'Image deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

export default router