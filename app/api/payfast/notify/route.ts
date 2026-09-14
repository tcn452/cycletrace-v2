import { NextResponse } from 'next/server'
import { createPayFastSignature } from '../../../lib/payfast'

export async function POST(request: Request) {
  const body = await request.formData()
  const fields = Object.fromEntries(body.entries()) as Record<string, string>
  const receivedSignature = fields.signature
  delete fields.signature

  if (process.env.PAYFAST_PASSPHRASE && receivedSignature && receivedSignature !== createPayFastSignature(fields, process.env.PAYFAST_PASSPHRASE)) {
    return NextResponse.json({ received: false, error: 'Invalid PayFast signature' }, { status: 400 })
  }

  console.info('PayFast ITN received', { paymentStatus: fields.payment_status, paymentId: fields.m_payment_id })
  return NextResponse.json({ received: true })
}
