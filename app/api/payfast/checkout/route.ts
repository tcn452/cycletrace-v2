import { NextResponse } from 'next/server'
import { createPayFastSignature, hasPayFastConfig, PAYFAST_SANDBOX_URL } from '../../../lib/payfast'

export async function POST(request: Request) {
  if (!hasPayFastConfig()) {
    return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 })
  }

  const { name, email } = await request.json() as { name?: string; email?: string }
  if (!name?.trim() || !email?.trim()) return NextResponse.json({ error: 'Account name and email are required.' }, { status: 400 })
  const [nameFirst, ...lastParts] = name.trim().split(/\s+/)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const fields = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${appUrl}/settings/billing?status=success`,
    cancel_url: `${appUrl}/settings/billing?status=cancelled`,
    notify_url: `${appUrl}/api/payfast/notify`,
    name_first: nameFirst,
    name_last: lastParts.join(' '),
    email_address: email.trim(),
    m_payment_id: `CT-${Date.now()}`,
    amount: '24.99',
    item_name: 'CycleTrace Protected',
    item_description: 'Monthly bicycle registry protection',
    subscription_type: '1',
    billing_date: new Date().toISOString().slice(0, 10),
    recurring_amount: '24.99',
    frequency: '3',
    cycles: '0',
  }

  return NextResponse.json({ action: PAYFAST_SANDBOX_URL, fields: { ...fields, signature: createPayFastSignature(fields, process.env.PAYFAST_PASSPHRASE) } })
}
