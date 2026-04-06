import prisma from "../prismaClient.js"

/**
 * createFolder(name, passwordHash)
 * Inserts a new folder row into the database.
*/
export const createFolder = async (name, passwordHash) => {
  return await prisma.folder.create({
    data: {
      name,
      passwordHash,
    }
  })
}

/**
 * getAllFolders()
 * Returns all folders ordered by createdAt descending.
 * We usually exclude the passwordHash here for security.
*/
export const getAllFolders = async () => {
  return await prisma.folder.findMany({
    orderBy: {
      createdAt: 'desc',
    }
  })
}

/**
 * getAllFoldersWithHash()
 * Returns only id, name, and passwordHash for all folders.
*/
export const getAllFoldersWithHash = async () => {
  return await prisma.folder.findMany({
    select: {
      id: true,
      name: true,
      passwordHash: true,
    }
  })
}

/**
  * updateFolderPassword(folderId, newHash)
  * Updates the passwordHash for a specific folder.
*/
export const updateFolderPassword = async (folderId, newHash) => {
  return await prisma.folder.update({
    where: {
      id: folderId,
    },
    data: {
      passwordHash: newHash,
    }
  })
}

/**
 * deleteFolder(folderId)
 * Deletes a folder by id. 
 * Note: If you set up "onDelete: Cascade" in your schema, 
 * this will also delete all associated images.
*/
export const deleteFolder = async (folderId) => {
  return await prisma.folder.delete({
    where: {
      id: folderId
    }
  })
}