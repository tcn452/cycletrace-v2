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
  await appwriteAccount.updateName({ name })
  return appwriteAccount.updatePrefs({ prefs })
}

export async function signOutFromAppwrite() {
  return appwriteAccount.deleteSession({ sessionId: 'current' })
}
