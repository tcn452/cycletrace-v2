import { NextResponse } from 'next/server'
import { Client, Query, TablesDB, Users } from 'node-appwrite'

function getServerClients() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const key = process.env.APPWRITE_API_KEY
  if (!endpoint || !project || !key) return null
  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key)
  return { tables: new TablesDB(client), users: new Users(client) }
}

export async function POST(request: Request) {
  const body = await request.json() as { token?: string; email?: string }
  const token = body.token?.trim()
  const email = body.email?.trim().toLowerCase()
  if (!token || !email) return NextResponse.json({ error: 'Transfer token and recipient email are required.' }, { status: 400 })

  const clients = getServerClients()
  if (!clients) return NextResponse.json({ error: 'Appwrite server integration is not configured.' }, { status: 503 })

  try {
    const transfers = await clients.tables.listRows({ databaseId: 'cycletrace', tableId: 'ownership_transfers', queries: [Query.equal('transferToken', [token])] })
    const transfer = transfers.rows[0] as unknown as { $id: string; bikeId: string; toEmail: string; status: string }
    if (!transfer || transfer.status !== 'pending' || transfer.toEmail.toLowerCase() !== email) return NextResponse.json({ error: 'This transfer is invalid, expired or belongs to another email.' }, { status: 400 })

    const users = await clients.users.list({ queries: [Query.equal('email', [email])] })
    const recipient = users.users[0]
    if (!recipient) return NextResponse.json({ error: 'Create a CycleTrace account with this email before accepting the transfer.' }, { status: 404 })

    await clients.tables.updateRow({ databaseId: 'cycletrace', tableId: 'bikes', rowId: transfer.bikeId, data: { ownerId: recipient.$id, ownerType: 'user' } })
    await clients.tables.updateRow({ databaseId: 'cycletrace', tableId: 'ownership_transfers', rowId: transfer.$id, data: { status: 'accepted', acceptedAt: new Date().toISOString() } })
    return NextResponse.json({ accepted: true, bikeId: transfer.bikeId })
  } catch {
    return NextResponse.json({ error: 'The transfer could not be completed.' }, { status: 500 })
  }
}
