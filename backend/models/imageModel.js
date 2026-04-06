import prisma from '../prismaClient.js'

export const createImage = async (folderId, fileName, storagePath) => {
  return await prisma.image.create({
    data: {
      folderId,
      fileName,
      storagePath,
    }
  })
}

export const getImagesByFolder = async (folderId) => {
  return await prisma.image.findMany({
    where: {
      folderId: folderId,
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
}

export const getImageById = async (imageId) => {
  return await prisma.image.findUnique({
    where: {
      id: imageId
    }
  })
}

export const deleteImage = async (imageId) => {
  return await prisma.image.delete({
    where: {
      id: imageId,
    }
  })
}