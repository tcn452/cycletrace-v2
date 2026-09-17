import { Models } from 'appwrite'
import { appwriteAccount, appwriteConfig, appwriteId, appwriteTables, appwriteDatabaseId } from './client'

export type OwnershipTransfer = Models.Row & {
  bikeId: string
  fromUserId: string
  toEmail: string
  toName: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message?: string
  transferToken: string
  createdAt: string
  acceptedAt?: string
}

export async function createOwnershipTransfer(input: { bikeId: string; toEmail: string; toName: string; message?: string }) {
  if (!appwriteConfig.configured) return null
  const user = await appwriteAccount.get()
  const transferToken = `${appwriteId.unique()}${appwriteId.unique()}`
  return appwriteTables.createRow<OwnershipTransfer>({
    databaseId: appwriteDatabaseId,
    tableId: 'ownership_transfers',
    rowId: appwriteId.unique(),
    data: { ...input, fromUserId: user.$id, status: 'pending', transferToken, createdAt: new Date().toISOString() },
    permissions: [`read("user:${user.$id}")`, `update("user:${user.$id}")`, `delete("user:${user.$id}")`],
  })
}
