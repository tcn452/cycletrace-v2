import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteConfig, appwriteId, appwriteTables, appwriteDatabaseId } from './client'

export type OwnershipTransfer = Models.Row & {
  bikeId: string
  fromUserId: string
  fromStoreId?: string
  fromStoreName?: string
  toEmail: string
  toName: string
  toPhone?: string
  invoiceRef?: string
  notes?: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message?: string
  transferToken: string
  certificateNumber?: string
  createdAt: string
  acceptedAt?: string
  bikeSummary?: {
    brand: string
    model: string
    year: number
    colour: string
    serialNumber: string
    image?: string
  }
}

const TRANSFERS_REGISTRY_KEY = 'cycletrace_transfers_registry'

export function getLocalTransfersRegistry(): OwnershipTransfer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TRANSFERS_REGISTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToLocalTransfersRegistry(transfer: OwnershipTransfer) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalTransfersRegistry()
    const index = existing.findIndex(t => t.$id === transfer.$id || t.transferToken === transfer.transferToken)
    if (index >= 0) {
      existing[index] = { ...existing[index], ...transfer }
    } else {
      existing.unshift(transfer)
    }
    window.localStorage.setItem(TRANSFERS_REGISTRY_KEY, JSON.stringify(existing))
  } catch {}
}

export async function createOwnershipTransfer(input: {
  bikeId: string
  toEmail: string
  toName: string
  message?: string
}) {
  if (!appwriteConfig.configured) return null
  const user = await appwriteAccount.get()
  const transferToken = `${appwriteId.unique()}${appwriteId.unique()}`
  const now = new Date().toISOString()
  const transferId = appwriteId.unique()

  const transferRecord: OwnershipTransfer = {
    $id: transferId,
    $databaseId: appwriteDatabaseId || 'cycletrace',
    $tableId: 'ownership_transfers',
    $createdAt: now,
    $updatedAt: now,
    $permissions: [],
    $sequence: '1',
    bikeId: input.bikeId,
    fromUserId: user.$id,
    toEmail: input.toEmail,
    toName: input.toName,
    message: input.message,
    status: 'pending',
    transferToken,
    createdAt: now,
  }

  try {
    const row = await appwriteTables.createRow<OwnershipTransfer>({
      databaseId: appwriteDatabaseId,
      tableId: 'ownership_transfers',
      rowId: transferId,
      data: {
        ...input,
        fromUserId: user.$id,
        status: 'pending',
        transferToken,
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
    Object.assign(transferRecord, row)
  } catch (err) {
    console.warn('Appwrite table write notice for ownership_transfer:', err)
  }

  saveToLocalTransfersRegistry(transferRecord)
  return transferRecord
}

export async function createStoreStockTransfer(input: {
  bikeId: string
  storeId: string
  storeName: string
  toEmail: string
  toName: string
  toPhone?: string
  invoiceRef?: string
  notes?: string
  bikeSummary?: {
    brand: string
    model: string
    year: number
    colour: string
    serialNumber: string
    image?: string
  }
}): Promise<OwnershipTransfer> {
  const user = await appwriteAccount.get()
  const transferToken = `${appwriteId.unique()}${appwriteId.unique()}`
  const now = new Date().toISOString()
  const transferId = appwriteId.unique()
  const certificateNumber = `CERT-CT-${input.storeId.slice(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const transferRecord: OwnershipTransfer = {
    $id: transferId,
    $databaseId: appwriteDatabaseId || 'cycletrace',
    $tableId: 'ownership_transfers',
    $createdAt: now,
    $updatedAt: now,
    $permissions: [],
    $sequence: '1',
    bikeId: input.bikeId,
    fromUserId: user.$id,
    fromStoreId: input.storeId,
    fromStoreName: input.storeName,
    toEmail: input.toEmail,
    toName: input.toName,
    toPhone: input.toPhone,
    invoiceRef: input.invoiceRef,
    notes: input.notes,
    status: 'accepted', // Store stock handovers are verified sales with paper trail
    transferToken,
    certificateNumber,
    createdAt: now,
    acceptedAt: now,
    bikeSummary: input.bikeSummary,
  }

  // 1. Try to record in Appwrite table
  try {
    const row = await appwriteTables.createRow<OwnershipTransfer>({
      databaseId: appwriteDatabaseId,
      tableId: 'ownership_transfers',
      rowId: transferId,
      data: {
        bikeId: input.bikeId,
        fromUserId: user.$id,
        toEmail: input.toEmail,
        toName: input.toName,
        status: 'accepted',
        transferToken,
        createdAt: now,
      },
      permissions: [
        'read("any")',
        'read("users")',
        `read("user:${user.$id}")`,
        'update("any")',
        'update("users")',
      ],
    })
    Object.assign(transferRecord, row)
  } catch (err) {
    console.warn('Appwrite table write notice for stock transfer:', err)
  }

  // 2. Try to update the bike record status to show handover
  try {
    await appwriteTables.updateRow({
      databaseId: appwriteDatabaseId,
      tableId: 'bikes',
      rowId: input.bikeId,
      data: {
        status: 'transferred',
      },
    })
  } catch {}

  // 3. Save to persistent registry
  saveToLocalTransfersRegistry(transferRecord)

  return transferRecord
}

export async function listStoreTransfers(storeId: string): Promise<OwnershipTransfer[]> {
  const map = new Map<string, OwnershipTransfer>()

  // 1. Read from local persistent registry
  const local = getLocalTransfersRegistry()
  for (const t of local) {
    if (t.fromStoreId === storeId || !t.fromStoreId) {
      map.set(t.$id, t)
    }
  }

  // 2. Query Appwrite database table
  try {
    const result = await appwriteTables.listRows<OwnershipTransfer>({
      databaseId: appwriteDatabaseId,
      tableId: 'ownership_transfers',
      queries: [Query.orderDesc('createdAt'), Query.limit(100)],
    })
    for (const row of result.rows) {
      if (!map.has(row.$id)) {
        map.set(row.$id, row)
        saveToLocalTransfersRegistry(row)
      }
    }
  } catch (err) {
    console.warn('Could not list transfers from Appwrite table:', err)
  }

  const list = Array.from(map.values())
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  return list
}

export async function getTransferById(transferIdOrCert: string): Promise<OwnershipTransfer | null> {
  const local = getLocalTransfersRegistry()
  const found = local.find(
    t => t.$id === transferIdOrCert || t.certificateNumber === transferIdOrCert || t.transferToken === transferIdOrCert
  )
  if (found) return found

  try {
    const result = await appwriteTables.listRows<OwnershipTransfer>({
      databaseId: appwriteDatabaseId,
      tableId: 'ownership_transfers',
      queries: [Query.equal('$id', [transferIdOrCert]), Query.limit(1)],
    })
    if (result.rows[0]) {
      saveToLocalTransfersRegistry(result.rows[0])
      return result.rows[0]
    }
  } catch {}

  return null
}
