'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowRight, FiCheck, FiPlus, FiShield } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { ProductOnboarding } from '../components/onboarding/ProductOnboarding'
import { bikes as demoBikes } from '../lib/demo-data'
import { BikeRecord, listAppwriteBikes } from '../lib/appwrite/bikes'
import { appwriteConfig } from '../lib/appwrite/client'

export default function DashboardClient() {
  const [bikes, setBikes] = useState<BikeRecord[]>([])
  const [loading, setLoading] = useState(appwriteConfig.configured)

  useEffect(() => {
    if (!appwriteConfig.configured) return
    listAppwriteBikes().then(setBikes).finally(() => setLoading(false))
  }, [])

  const displayedBikes = appwriteConfig.configured ? bikes : demoBikes.map(bike => ({ ...bike, $id: bike.id, serialNumber: bike.serial, ownerId: 'demo', photoFileId: undefined, createdAt: '2024-08-12T00:00:00.000Z', status: 'protected' as const }))
  return <ProductOnboarding role="rider"><DemoShell showSidebar><div className="dashboard-heading"><div><p className="eyebrow dark-eyebrow">Tuesday, 24 September 2026</p><h1>Good morning,<br /><span>Kayla.</span></h1></div><Link className="button button-green" href="/register"><FiPlus /> Register another bike</Link></div><div className="dashboard-alert"><span className="alert-symbol"><FiShield /></span><div><strong>{appwriteConfig.configured ? 'Your Appwrite record is active' : 'Your protection is active'}</strong><p>{appwriteConfig.configured ? 'Live records are being loaded from the CycleTrace Appwrite project.' : '2 bikes are registered to your account. Your next renewal is 24 October 2026.'}</p></div><Link href="/settings/billing">Manage plan <FiArrowRight /></Link></div><div className="dashboard-stats"><div><span>Protected bikes</span><strong>{loading ? '—' : String(displayedBikes.length).padStart(2, '0')}</strong><small>Live registry records</small></div><div><span>Registry views</span><strong>18</strong><small>Last 30 days</small></div><div><span>Account status</span><strong className="green-text">Active</strong><small>Since Aug 2024</small></div></div><section className="dashboard-section" id="bikes"><div className="section-title"><div><p className="eyebrow dark-eyebrow">Your collection</p><h2>My bikes <span>({displayedBikes.length})</span></h2></div><Link className="text-link dark-link" href="/register">Add a bike <FiPlus /></Link></div>{loading ? <div className="empty-state">Loading your Appwrite bike records…</div> : displayedBikes.length === 0 ? <div className="empty-state"><h3>No bikes registered yet</h3><p>Register your first bike to create an Appwrite ownership record.</p><Link className="button button-green" href="/register">Register a bike <FiPlus /></Link></div> : <div className="bike-table">{displayedBikes.map(bike => <div className="owned-bike" key={bike.$id}><div className="owned-bike-image" style={{ backgroundImage: `url(${bike.image || '/cycletrace-logo.png'})` }} /><div className="owned-bike-info"><span className="status"><FiCheck /> {bike.status === 'protected' ? 'Protected' : bike.status}</span><h3>{bike.brand} {bike.model}</h3><p>{bike.year} · {bike.colour}</p><span className="serial">{bike.serialNumber}</span></div><div className="owned-bike-meta"><span>Last updated</span><strong>{new Date(bike.createdAt).toLocaleDateString('en-ZA')}</strong><Link href={`/dashboard/bikes/${bike.$id}`}>View record <FiArrowRight /></Link><Link href="/dashboard/transfer">Transfer ownership</Link></div><span className="row-arrow"><FiArrowRight /></span></div>)}</div>}</section><section className="dashboard-bottom"><div className="activity-panel"><div className="section-title"><div><p className="eyebrow dark-eyebrow">Recent activity</p><h2>Stay in the <span>loop.</span></h2></div><span className="view-all">View all</span></div><div className="activity-item"><span className="activity-dot green-dot"><FiCheck /></span><div><strong>Record synced</strong><p>CycleTrace Appwrite workspace · Just now</p></div></div></div><div className="dashboard-help"><span className="help-icon">?</span><h3>Need to report a theft?</h3><p>We&apos;ll guide you through the information needed to get your bike in front of the right people.</p><Link className="button button-dark" href="/dashboard/report">Report a stolen bike <FiArrowRight /></Link></div></section></DemoShell></ProductOnboarding>
}
