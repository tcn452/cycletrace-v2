import { Models, Query } from 'appwrite'
import { appwriteAccount, appwriteConfig, appwriteDatabaseId, appwriteTables } from './client'

export type InsurerPolicy = Models.Row & {
  organizationId: string
  bikeId: string
  policyNumber: string
  status: 'active' | 'review_due' | 'expired' | 'claim_open'
  insuredValue: number
  verifiedAt?: string
  createdAt: string
}

export type InsurerMember = Models.Row & {
  organizationId: string
  userId: string
  email: string
  role: 'admin' | 'reviewer' | 'claims'
}

export type InsurerCheck = Models.Row & {
  organizationId: string
  bikeId?: string
  memberId: string
  serialNumber: string
  result: 'match' | 'mismatch' | 'stolen' | 'not_found'
  confidence: number
  createdAt: string
}

export type InsurerClaim = Models.Row & {
  organizationId: string
  policyId: string
  bikeId: string
  status: 'open' | 'in_review' | 'approved' | 'rejected' | 'closed'
  issueType: 'serial_mismatch' | 'theft' | 'transfer_pending' | 'other'
  submittedAt: string
  assignedTo?: string
}

export async function getInsurerWorkspace() {
  if (!appwriteConfig.configured) return null
  const user = await appwriteAccount.get()
  const members = await appwriteTables.listRows<InsurerMember>({ databaseId: appwriteDatabaseId, tableId: 'insurer_members', queries: [Query.equal('userId', user.$id)] })
  const member = members.rows[0]
  if (!member) return { member: null, policies: [], checks: [], claims: [] }
  const orgQuery = [Query.equal('organizationId', member.organizationId)]
  const [policies, checks, claims] = await Promise.all([
    appwriteTables.listRows<InsurerPolicy>({ databaseId: appwriteDatabaseId, tableId: 'policies', queries: orgQuery }),
    appwriteTables.listRows<InsurerCheck>({ databaseId: appwriteDatabaseId, tableId: 'verification_checks', queries: orgQuery }),
    appwriteTables.listRows<InsurerClaim>({ databaseId: appwriteDatabaseId, tableId: 'insurer_claims', queries: orgQuery }).catch(() => ({ rows: [] as InsurerClaim[] })),
  ])
  return { member, policies: policies.rows, checks: checks.rows, claims: claims.rows }
}
