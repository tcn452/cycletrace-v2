import crypto from 'node:crypto'

export const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process'

export function createPayFastSignature(fields: Record<string, string>, passphrase?: string) {
  const pairs = Object.entries(fields)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, '+')}`)

  const payload = `${pairs.join('&')}${passphrase ? `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}` : ''}`
  return crypto.createHash('md5').update(payload).digest('hex')
}

export function hasPayFastConfig() {
  return Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY && process.env.PAYFAST_PASSPHRASE)
}
