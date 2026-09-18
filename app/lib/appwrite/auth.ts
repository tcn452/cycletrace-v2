import { AppwriteException } from 'appwrite'
import { appwriteAccount, appwriteId } from './client'

export async function getCurrentAppwriteUser() {
  try {
    return await appwriteAccount.get()
  } catch {
    return null
  }
}

export async function signInWithAppwrite(email: string, password: string) {
  return appwriteAccount.createEmailPasswordSession({ email, password })
}

export async function createAppwriteAccount(email: string, password: string, name: string) {
  const user = await appwriteAccount.create({ userId: appwriteId.unique(), email, password, name })
  await appwriteAccount.createEmailPasswordSession({ email, password })
  return user
}

export async function createOrResumeAppwriteAccount(email: string, password: string, name: string) {
  const current = await getCurrentAppwriteUser()
  if (current) {
    if (current.email.toLowerCase() !== email.toLowerCase()) throw new Error(`You are already signed in as ${current.email}. Use that account or sign out first.`)
    return current
  }
  try {
    return await createAppwriteAccount(email, password, name)
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      try { await signInWithAppwrite(email, password); return await appwriteAccount.get() }
      catch { throw new Error('An account already exists for this email. Enter its existing password, or sign in first.') }
    }
    throw error
  }
}

export async function updateAppwriteProfile(name: string, prefs: Record<string, string | boolean>) {
  if (name?.trim()) {
    await appwriteAccount.updateName({ name: name.trim() })
  }
  const current = await getCurrentAppwriteUser()
  const currentPrefs = (current?.prefs as Record<string, unknown>) || {}
  const cleanPrefs: Record<string, string | boolean> = {}
  for (const [k, v] of Object.entries(currentPrefs)) {
    if (typeof v === 'string' || typeof v === 'boolean') {
      cleanPrefs[k] = v
    }
  }
  for (const [k, v] of Object.entries(prefs)) {
    if (v !== undefined && (typeof v === 'string' || typeof v === 'boolean')) {
      cleanPrefs[k] = v
    }
  }
  return appwriteAccount.updatePrefs({ prefs: cleanPrefs })
}

export async function updateAppwritePassword(password: string, oldPassword?: string) {
  return appwriteAccount.updatePassword({ password, oldPassword })
}

export async function requestPasswordRecovery(email: string, redirectUrl?: string) {
  const url =
    redirectUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : 'https://cycletrace.co.za/reset-password')
  return appwriteAccount.createRecovery({ email, url })
}

export async function resetPasswordWithRecovery(params: {
  userId: string
  secret: string
  password: string
}) {
  return appwriteAccount.updateRecovery(params)
}

export async function signOutFromAppwrite() {
  return appwriteAccount.deleteSession({ sessionId: 'current' })
}
