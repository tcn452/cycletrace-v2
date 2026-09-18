import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteDatabaseId, appwriteId, appwriteTables } from './client'
import { listAppwriteBikes } from './bikes'
import { loadAdminOverview, reviewApplication } from './platform'

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

const REGISTRY_STORAGE_KEY = 'cycletrace_registered_stores'

export function getLocalStoreRegistry(): StoreOwner[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REGISTRY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToLocalStoreRegistry(store: StoreOwner) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalStoreRegistry()
    const index = existing.findIndex(
      s =>
        s.$id === store.$id ||
        (s.userId && store.userId && s.userId === store.userId) ||
        (s.businessName.trim().toLowerCase() === store.businessName.trim().toLowerCase() &&
          s.email.trim().toLowerCase() === store.email.trim().toLowerCase())
    )
    if (index >= 0) {
      existing[index] = { ...existing[index], ...store }
    } else {
      existing.unshift(store)
    }
    window.localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(existing))
  } catch {}
}

export async function getStoreWorkspace() {
  const user = await appwriteAccount.get()
  let store: StoreOwner | null = null

  // 1. Try to fetch from Appwrite database table
  try {
    const stores = await appwriteTables.listRows<StoreOwner>({
      databaseId: appwriteDatabaseId,
      tableId: 'store_owners',
      queries: [Query.equal('userId', user.$id), Query.limit(1)],
    })
    if (stores.rows.length > 0) {
      store = stores.rows[0]
      saveToLocalStoreRegistry(store)
    }
  } catch (err) {
    console.warn('Could not query store_owners table:', err)
  }

  // 2. Fall back to user preferences on Appwrite account
  if (!store && user.prefs && typeof user.prefs === 'object') {
    const prefStore = (user.prefs as Record<string, unknown>).store as StoreOwner | undefined
    if (prefStore && prefStore.businessName) {
      store = prefStore
      saveToLocalStoreRegistry(store)
    }
  }

  // 3. Fall back to local store registry
  if (!store) {
    const localStores = getLocalStoreRegistry()
    const found = localStores.find(
      s =>
        s.userId === user.$id ||
        (user.email && s.email && s.email.trim().toLowerCase() === user.email.trim().toLowerCase())
    )
    if (found) {
      store = found
    }
  }

  // 4. If store found, check if local registry has an updated status (e.g. verified by admin)
  if (store) {
    const localStores = getLocalStoreRegistry()
    const match = localStores.find(
      s =>
        s.$id === store!.$id ||
        (s.userId && store!.userId && s.userId === store!.userId) ||
        (s.email && store!.email && s.email.trim().toLowerCase() === store!.email.trim().toLowerCase())
    )
    if (match && match.status !== store.status) {
      store = { ...store, status: match.status }
    }
  }

  const bikes = store ? await listAppwriteBikes(store.$id) : []
  return { user, store, bikes }
}

export async function createStoreOwner(
  input: Omit<StoreOwner, keyof Models.Row | 'userId' | 'status' | 'createdAt'>
): Promise<StoreOwner> {
  const user = await appwriteAccount.get()
  const storeId = appwriteId.unique()
  const now = new Date().toISOString()

  const storeData: StoreOwner = {
    $id: storeId,
    $databaseId: appwriteDatabaseId || 'cycletrace',
    $tableId: 'store_owners',
    $createdAt: now,
    $updatedAt: now,
    $permissions: [],
    $sequence: '1',
    userId: user.$id,
    businessName: input.businessName,
    contactName: input.contactName,
    email: input.email || user.email,
    phone: input.phone,
    address: input.address,
    status: 'pending',
    createdAt: now,
  }

  // 1. Try to create in Appwrite database table
  try {
    const row = await appwriteTables.createRow<StoreOwner>({
      databaseId: appwriteDatabaseId,
      tableId: 'store_owners',
      rowId: storeId,
      data: {
        userId: user.$id,
        businessName: input.businessName,
        contactName: input.contactName,
        email: input.email || user.email,
        phone: input.phone,
        address: input.address,
        status: 'pending',
        createdAt: now,
      },
      permissions: [
        'read("any")',
        'read("users")',
        `read("user:${user.$id}")`,
        'update("any")',
        'update("users")',
        `update("user:${user.$id}")`,
      ],
    })
    Object.assign(storeData, row)
  } catch (err) {
    console.warn('Appwrite store_owners table write notice, saving to profile and registry:', err)
  }

  // 2. Persist to Appwrite account preferences
  try {
    const existingPrefs = (user.prefs || {}) as Record<string, unknown>
    await appwriteAccount.updatePrefs({
      ...existingPrefs,
      role: 'store_owner',
      store: storeData,
    })
  } catch (err) {
    console.warn('Could not update user prefs:', err)
  }

  // 3. Persist to local store registry
  saveToLocalStoreRegistry(storeData)

  return storeData
}

export async function listAllStores(): Promise<StoreOwner[]> {
  const storeMap = new Map<string, StoreOwner>()

  // 1. Read from persistent local registry
  const localStores = getLocalStoreRegistry()
  for (const s of localStores) {
    storeMap.set(s.$id, s)
  }

  // 2. Query Appwrite database table
  try {
    const result = await appwriteTables.listRows<StoreOwner>({
      databaseId: appwriteDatabaseId,
      tableId: 'store_owners',
      queries: [Query.orderDesc('createdAt'), Query.limit(100)],
    })
    for (const row of result.rows) {
      storeMap.set(row.$id, row)
      saveToLocalStoreRegistry(row)
    }
  } catch (err) {
    console.warn('Could not list store_owners from Appwrite table:', err)
  }

  // 3. Query server overview endpoint
  try {
    const overview = await loadAdminOverview()
    if (overview?.stores && Array.isArray(overview.stores)) {
      for (const s of overview.stores as (Record<string, unknown> & { $id: string })[]) {
        const id = String(s.$id || s.rowId || appwriteId.unique())
        const converted: StoreOwner = {
          $id: id,
          $databaseId: appwriteDatabaseId || 'cycletrace',
          $tableId: 'store_owners',
          $createdAt: String(s.createdAt || s.$createdAt || new Date().toISOString()),
          $updatedAt: String(s.$updatedAt || new Date().toISOString()),
          $permissions: [],
          $sequence: '1',
          userId: String(s.userId || ''),
          businessName: String(s.businessName || s.organizationName || 'Bike Store'),
          contactName: String(s.contactName || ''),
          email: String(s.email || s.applicantEmail || ''),
          phone: String(s.phone || ''),
          address: String(s.address || ''),
          status: s.status === 'approved' || s.status === 'verified' ? 'verified' : (s.status === 'rejected' ? 'rejected' : 'pending'),
          createdAt: String(s.createdAt || s.submittedAt || new Date().toISOString()),
        }
        storeMap.set(id, converted)
        saveToLocalStoreRegistry(converted)
      }
    }
    if (overview?.applications && Array.isArray(overview.applications)) {
      for (const a of overview.applications as (Record<string, unknown> & { $id: string })[]) {
        if (a.type === 'store') {
          const id = String(a.$id || appwriteId.unique())
          if (!storeMap.has(id)) {
            const converted: StoreOwner = {
              $id: id,
              $databaseId: appwriteDatabaseId || 'cycletrace',
              $tableId: 'store_owners',
              $createdAt: String(a.submittedAt || new Date().toISOString()),
              $updatedAt: String(a.reviewedAt || new Date().toISOString()),
              $permissions: [],
              $sequence: '1',
              userId: String(a.applicantUserId || ''),
              businessName: String(a.organizationName || 'Bike Store'),
              contactName: String(a.contactName || ''),
              email: String(a.applicantEmail || ''),
              phone: String(a.phone || ''),
              address: String(a.address || ''),
              status: a.status === 'approved' || a.status === 'verified' ? 'verified' : (a.status === 'rejected' ? 'rejected' : 'pending'),
              createdAt: String(a.submittedAt || new Date().toISOString()),
            }
            storeMap.set(id, converted)
            saveToLocalStoreRegistry(converted)
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not list stores from server overview:', err)
  }

  const list = Array.from(storeMap.values())
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  return list
}

export async function verifyStoreOwner(
  storeId: string,
  status: 'verified' | 'pending' | 'rejected' = 'verified'
) {
  // 1. Update in local registry
  const localStores = getLocalStoreRegistry()
  const target = localStores.find(s => s.$id === storeId)
  if (target) {
    target.status = status
    saveToLocalStoreRegistry(target)
  }

  // 2. Try Appwrite database table
  try {
    await appwriteTables.updateRow<StoreOwner>({
      databaseId: appwriteDatabaseId,
      tableId: 'store_owners',
      rowId: storeId,
      data: { status },
    })
  } catch {}

  // 3. Try server review endpoint
  try {
    const serverStatus = status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'submitted'
    await reviewApplication(storeId, serverStatus)
  } catch {}

  // 4. Update user prefs if current logged in user owns this store
  try {
    const user = await appwriteAccount.get()
    const prefStore = (user.prefs as Record<string, unknown> | undefined)?.store as StoreOwner | undefined
    if (prefStore && (prefStore.$id === storeId || prefStore.userId === user.$id)) {
      await appwriteAccount.updatePrefs({
        ...(user.prefs || {}),
        store: { ...prefStore, status },
      })
    }
  } catch {}

  return { ok: true, status }
}
