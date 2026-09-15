import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteBikePhotosBucketId, appwriteConfig, appwriteId, appwriteStorage, appwriteTables, appwriteDatabaseId } from './client'

export type BikeRecord = Models.Row & {
  ownerId: string
  brand: string
  model: string
  serialNumber: string
  year: number
  colour: string
  location: string
  ownerType?: 'user' | 'store'
  photoFileId?: string
  status: 'protected' | 'stolen' | 'transferred'
  createdAt: string
  image?: string
}

export type NewBikeRecord = Pick<BikeRecord, 'brand' | 'model' | 'serialNumber' | 'year' | 'colour' | 'location' | 'status' | 'createdAt' | 'ownerType'> & { photo: File }

const tableId = 'bikes'

function withImage(row: BikeRecord) {
  return {
    ...row,
    image: row.photoFileId ? appwriteStorage.getFileView({ bucketId: appwriteBikePhotosBucketId, fileId: row.photoFileId }).toString() : undefined,
  }
}

export async function listAppwriteBikes(ownerId?: string) {
  if (!appwriteConfig.configured) return []
  const queries = ownerId ? [Query.equal('ownerId', ownerId), Query.orderDesc('createdAt')] : [Query.orderDesc('createdAt')]
  const result = await appwriteTables.listRows<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, queries })
  return result.rows.map(withImage)
}

export async function getAppwriteBike(id: string) {
  if (!appwriteConfig.configured) return null
  try {
    return withImage(await appwriteTables.getRow<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, rowId: id }))
  } catch {
    return null
  }
}

export async function createAppwriteBike(input: NewBikeRecord) {
  const user = await appwriteAccount.get()
  const { photo, ...bikeData } = input
  const photoFileId = appwriteId.unique()
  await appwriteStorage.createFile({ bucketId: appwriteBikePhotosBucketId, fileId: photoFileId, file: photo, permissions: ['read("any")'] })
  const row = await appwriteTables.createRow<BikeRecord>({
    databaseId: appwriteDatabaseId,
    tableId,
    rowId: appwriteId.unique(),
    data: { ...bikeData, ownerId: user.$id, photoFileId },
    permissions: [`read("any")`, `update("user:${user.$id}")`, `delete("user:${user.$id}")`],
  })
  return withImage(row)
}
