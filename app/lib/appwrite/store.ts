import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteDatabaseId, appwriteId, appwriteTables } from './client'
import { listAppwriteBikes } from './bikes'

export type StoreOwner = Models.Row & {
  userId: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
}

export async function getStoreWorkspace() {
  const user = await appwriteAccount.get()
  const stores = await appwriteTables.listRows<StoreOwner>({ databaseId: appwriteDatabaseId, tableId: 'store_owners', queries: [Query.equal('userId', user.$id), Query.limit(1)] })
  const store = stores.rows[0] || null
  const bikes = store ? await listAppwriteBikes(store.$id) : []
  return { user, store, bikes }
}

export async function createStoreOwner(input: Omit<StoreOwner, keyof Models.Row | 'userId' | 'status' | 'createdAt'>) {
  const user = await appwriteAccount.get()
  return appwriteTables.createRow<StoreOwner>({
    databaseId: appwriteDatabaseId,
    tableId: 'store_owners',
    rowId: appwriteId.unique(),
    data: { ...input, userId: user.$id, status: 'pending', createdAt: new Date().toISOString() },
    permissions: [
      'read("any")',
      'read("users")',
      `read("user:${user.$id}")`,
      'update("any")',
      'update("users")',
      `update("user:${user.$id}")`,
    ],
  })
}

export async function listAllStores() {
  try {
    const result = await appwriteTables.listRows<StoreOwner>({
      databaseId: appwriteDatabaseId,
      tableId: 'store_owners',
      queries: [Query.orderDesc('createdAt'), Query.limit(100)],
    })
    return result.rows
  } catch {
    return []
  }
}

export async function verifyStoreOwner(storeId: string, status: 'verified' | 'pending' | 'rejected' = 'verified') {
  return appwriteTables.updateRow<StoreOwner>({
    databaseId: appwriteDatabaseId,
    tableId: 'store_owners',
    rowId: storeId,
    data: { status },
  })
}
