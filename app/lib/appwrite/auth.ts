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
  return appwriteAccount.create({ userId: appwriteId.unique(), email, password, name })
}

export async function signOutFromAppwrite() {
  return appwriteAccount.deleteSession({ sessionId: 'current' })
}
