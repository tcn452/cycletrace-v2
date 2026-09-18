'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'
import { getCurrentAppwriteUser } from '../../lib/appwrite/auth'
import { BikeRecord, listAppwriteBikes } from '../../lib/appwrite/bikes'
import { createOwnershipTransfer } from '../../lib/appwrite/transfers'

export default function TransferPage() {
  const [bikes, setBikes] = useState<BikeRecord[]>([])
  const [bikeId, setBikeId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { getCurrentAppwriteUser().then(async user => { if (!user) throw new Error(); const rows = await listAppwriteBikes(user.$id); setBikes(rows); setBikeId(rows[0]?.$id || '') }).catch(() => setError('Sign in to transfer a bike.')).finally(() => setLoading(false)) }, [])
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); try { const transfer = await createOwnershipTransfer({ bikeId, toEmail: email, toName: name, message }); if (!transfer) throw new Error(); setToken(transfer.transferToken) } catch { setError('The transfer could not be processed.') } }
  const bike = bikes.find(row => row.$id === bikeId)
  if (token) return <DemoShell active="My bikes"><div className="success-panel"><span className="success-icon"><FiCheck /></span><p className="eyebrow dark-eyebrow">Transfer initiated</p><h1>The bike is<br /><span>changing hands.</span></h1><p>{bike?.brand} {bike?.model} will remain linked to you until {name} accepts.</p><div className="success-actions"><Link className="button button-green" href="/dashboard">Return to dashboard <FiArrowRight /></Link><Link className="text-link dark-link" href={`/transfer/${token}`}>Open recipient link <FiArrowRight /></Link></div></div></DemoShell>
  return <DemoShell active="My bikes"><Link className="back-link" href="/dashboard">← Back to dashboard</Link><div className="transfer-layout"><div className="transfer-intro"><p className="eyebrow dark-eyebrow">Change of ownership</p><h1>Transfer a<br /><span>bike.</span></h1><p>Create a verified ownership transfer record.</p></div><div className="form-card transfer-card">{loading ? <div className="empty-state">Loading your bikes…</div> : bikes.length === 0 ? <div className="empty-state"><h3>No bikes available</h3><p>Register a bike before starting a transfer.</p></div> : <form onSubmit={submit}><h2>Transfer details</h2><label>Bike<select required value={bikeId} onChange={event => setBikeId(event.target.value)}>{bikes.map(row => <option value={row.$id} key={row.$id}>{row.brand} {row.model} · {row.serialNumber}</option>)}</select></label><label>New owner&apos;s full name<input required value={name} onChange={event => setName(event.target.value)} /></label><label>New owner&apos;s email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} /></label><label>Message <span className="optional">optional</span><textarea rows={3} value={message} onChange={event => setMessage(event.target.value)} /></label><label className="check-label"><input required type="checkbox" /> I confirm this is a legitimate transfer.</label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-green" type="submit">Send transfer request <FiArrowRight /></button></form>}</div></div></DemoShell>
}
