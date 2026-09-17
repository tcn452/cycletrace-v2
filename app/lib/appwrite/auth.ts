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

export async function updateAppwriteProfile(name: string, prefs: Record<string, string | boolean>) {
  await appwriteAccount.updateName({ name })
  return appwriteAccount.updatePrefs({ prefs })
}

export async function signOutFromAppwrite() {
  return appwriteAccount.deleteSession({ sessionId: 'current' })
}
