import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteBikePhotosBucketId, appwriteId, appwriteStorage, appwriteTables, appwriteDatabaseId } from './client'

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
  handoverRef?: string
  storeOwnerId?: string
}

export type NewBikeRecord = Pick<BikeRecord, 'brand' | 'model' | 'serialNumber' | 'year' | 'colour' | 'location' | 'status' | 'createdAt'> & { ownerType?: 'user' | 'store'; photo: File }

const tableId = 'bikes'

function withImage(row: BikeRecord) {
  return {
    ...row,
    image: row.photoFileId ? appwriteStorage.getFileView({ bucketId: appwriteBikePhotosBucketId, fileId: row.photoFileId }).toString() : undefined,
  }
}

export async function listAppwriteBikes(ownerId?: string) {
  const queries = ownerId ? [Query.equal('ownerId', ownerId), Query.orderDesc('createdAt')] : [Query.orderDesc('createdAt')]
  const result = await appwriteTables.listRows<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, queries })
  return result.rows.map(withImage)
}

export async function getAppwriteBike(id: string) {
  try {
    return withImage(await appwriteTables.getRow<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, rowId: id }))
  } catch {
    return null
  }
}

export async function searchAppwriteBikes(search: string) {
  const term = search.trim()
  if (!term) return []
  const result = await appwriteTables.listRows<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, queries: [Query.limit(100)] })
  const normalized = term.toLocaleLowerCase()
  return result.rows.filter(row => [row.serialNumber, row.brand, row.model].some(value => value.toLocaleLowerCase().includes(normalized))).map(withImage)
}

export async function listStolenBikes(limit = 100) {
  try {
    const result = await appwriteTables.listRows<BikeRecord>({
      databaseId: appwriteDatabaseId,
      tableId,
      queries: [Query.equal('status', 'stolen'), Query.orderDesc('createdAt'), Query.limit(limit)],
    })
    return result.rows.map(withImage)
  } catch {
    const result = await appwriteTables.listRows<BikeRecord>({
      databaseId: appwriteDatabaseId,
      tableId,
      queries: [Query.orderDesc('createdAt'), Query.limit(limit)],
    })
    return result.rows.filter(row => row.status === 'stolen').map(withImage)
  }
}

export async function listAllPublicBikes(limit = 100) {
  const result = await appwriteTables.listRows<BikeRecord>({
    databaseId: appwriteDatabaseId,
    tableId,
    queries: [Query.orderDesc('createdAt'), Query.limit(limit)],
  })
  return result.rows.map(withImage)
}

export async function updateAppwriteBikeStatus(id: string, status: BikeRecord['status']) {
  return appwriteTables.updateRow<BikeRecord>({ databaseId: appwriteDatabaseId, tableId, rowId: id, data: { status } })
}

export async function updateAppwriteBikeDetails(
  id: string,
  data: Partial<Pick<BikeRecord, 'location' | 'colour' | 'year' | 'brand' | 'model'>>
) {
  const row = await appwriteTables.updateRow<BikeRecord>({
    databaseId: appwriteDatabaseId,
    tableId,
    rowId: id,
    data,
  })
  return withImage(row)
}

export async function createAppwriteBike(input: NewBikeRecord, customOwnerId?: string) {
  const user = await appwriteAccount.get()
  const { photo, ...bikeData } = input
  const photoFileId = appwriteId.unique()
  await appwriteStorage.createFile({ bucketId: appwriteBikePhotosBucketId, fileId: photoFileId, file: photo, permissions: ['read("any")', `update("user:${user.$id}")`, `delete("user:${user.$id}")`] })
  try {
    const row = await appwriteTables.createRow<BikeRecord>({
      databaseId: appwriteDatabaseId,
      tableId,
      rowId: appwriteId.unique(),
      data: { ...bikeData, ownerType: bikeData.ownerType || 'user', ownerId: customOwnerId || user.$id, photoFileId },
      permissions: ['read("any")', `update("user:${user.$id}")`, `delete("user:${user.$id}")`],
    })
    return withImage(row)
  } catch (error) {
    await appwriteStorage.deleteFile({ bucketId: appwriteBikePhotosBucketId, fileId: photoFileId }).catch(() => undefined)
    throw error
  }
}
