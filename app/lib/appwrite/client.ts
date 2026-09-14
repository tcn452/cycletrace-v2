import { Account, Client, ID, Storage, TablesDB } from 'appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa80c46003e754665f6'
export const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'cycletrace'
export const appwriteBikePhotosBucketId = process.env.NEXT_PUBLIC_APPWRITE_BIKE_PHOTOS_BUCKET_ID || 'bikephotos'

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
  configured: Boolean(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
}
