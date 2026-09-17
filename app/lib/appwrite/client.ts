import { Account, Client, ID, Storage, TablesDB } from 'appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
export const appwriteBikePhotosBucketId = process.env.NEXT_PUBLIC_APPWRITE_BIKE_PHOTOS_BUCKET_ID

if (!endpoint || !projectId || !appwriteDatabaseId || !appwriteBikePhotosBucketId) {
  throw new Error('CycleTrace Appwrite environment variables are not configured.')
}

export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId)
export const appwriteAccount = new Account(appwriteClient)
export const appwriteStorage = new Storage(appwriteClient)
export const appwriteTables = new TablesDB(appwriteClient)
export const appwriteId = ID

export const appwriteConfig = {
  endpoint,
  projectId,
  databaseId: appwriteDatabaseId,
  bikePhotosBucketId: appwriteBikePhotosBucketId,
  configured: true,
}
