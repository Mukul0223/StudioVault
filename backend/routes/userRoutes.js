import express from 'express'
import bcrypt from 'bcrypt'
import * as folderModel from '../models/folderModel.js'
import * as imageModel from '../models/imageModel.js'
import * as storageModel from '../storage/storageModel.js'

const router = express.Router()

router.post('/unlock', async (req, res) => {
  try {
    const { password } = req.body
    const folders = await folderModel.getAllFoldersWithHash()
    
    for (const folder of folders) {
      const match = await bcrypt.compare(password, folder.passwordHash)
      
      if (match) {
        return res.status(200).json({
          folderId: folder.id,
          folderName: folder.name
        })
      }
    }
    return res.status(401).json({ message: 'Unauthorized' })
  } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' })
  } 
})

router.get('/folders/:id/images', async (req, res) => {
  try {
    const images = await imageModel.getImagesByFolder(req.params.id)
    res.status(200).json(images)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

router.get('/images/:id/download', async (req, res) => {
  try {
    const image = await imageModel.getImageById(req.params.id)
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }
    
    const { signedUrl, error } = await storageModel.getSignedUrl(image.storagePath)
    
    if (error || !signedUrl) {
      return res.status(500).json({ message: 'Internal Server Error' })
    }
    
    res.status(200).json({ url: signedUrl })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

export default router