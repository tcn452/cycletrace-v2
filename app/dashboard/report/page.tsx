'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'
import { getCurrentAppwriteUser } from '../../lib/appwrite/auth'
import { BikeRecord, listAppwriteBikes, updateAppwriteBikeStatus } from '../../lib/appwrite/bikes'

export default function ReportPage() {
  const [bikes, setBikes] = useState<BikeRecord[]>([])
  const [bikeId, setBikeId] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { getCurrentAppwriteUser().then(async user => { if (!user) throw new Error(); const rows = await listAppwriteBikes(user.$id); setBikes(rows); setBikeId(rows[0]?.$id || '') }).catch(() => setError('Sign in to report a stolen bike.')) }, [])
  async function submit(event: FormEvent) { event.preventDefault(); try { await updateAppwriteBikeStatus(bikeId, 'stolen'); setSent(true) } catch { setError('The record could not be updated.') } }
  if (sent) return <DemoShell active="My bikes"><div className="success-panel"><span className="success-icon"><FiCheck /></span><h1>Bike marked<br /><span>as stolen.</span></h1><p>The public record now shows the stolen status.</p><Link className="button button-green" href={`/bikes/${bikeId}`}>View public record <FiArrowRight /></Link></div></DemoShell>
  return <DemoShell active="My bikes"><Link className="back-link" href="/dashboard">← Back to dashboard</Link><div className="report-layout"><div className="report-intro"><p className="eyebrow dark-eyebrow">Urgent action</p><h1>Report a<br /><span>stolen bike.</span></h1><p>This immediately updates the selected bike record in the registry.</p></div><div className="form-card report-card">{bikes.length === 0 ? <div className="empty-state">No bike records are available.</div> : <form onSubmit={submit}><h2>Which bike was stolen?</h2><label>Bike<select required value={bikeId} onChange={event => setBikeId(event.target.value)}>{bikes.map(bike => <option value={bike.$id} key={bike.$id}>{bike.brand} {bike.model} · {bike.serialNumber}</option>)}</select></label><label className="check-label"><input required type="checkbox" /> I confirm this report is accurate.</label>{error && <p className="auth-error">{error}</p>}<button className="button button-green full-button" type="submit">Mark as stolen <FiArrowRight /></button></form>}</div></div></DemoShell>
}
