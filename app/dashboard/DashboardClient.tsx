'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowRight, FiCheck, FiPlus, FiShield } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { ProductOnboarding } from '../components/onboarding/ProductOnboarding'
import { getCurrentAppwriteUser } from '../lib/appwrite/auth'
import { BikeRecord, listAppwriteBikes } from '../lib/appwrite/bikes'

export default function DashboardClient() {
  const [bikes, setBikes] = useState<BikeRecord[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentAppwriteUser().then(async user => {
      if (!user) { setNeedsLogin(true); return }
      setName(user.name || user.email)
      setBikes(await listAppwriteBikes(user.$id))
    }).catch(() => setError('Your bike records could not be loaded.')).finally(() => setLoading(false))
  }, [])

  if (needsLogin) return <DemoShell><div className="empty-state"><h3>Sign in to view your dashboard</h3><p>Your dashboard only shows records linked to your account.</p><Link className="button button-green" href="/login">Sign in <FiArrowRight /></Link></div></DemoShell>

  return <ProductOnboarding role="rider"><DemoShell showSidebar><div className="dashboard-heading"><div><p className="eyebrow dark-eyebrow">CycleTrace workspace</p><h1>Welcome back{name ? ',' : '.'}<br />{name && <span>{name}.</span>}</h1></div><Link className="button button-green" href="/register?mode=bike"><FiPlus /> Register another bike</Link></div><div className="dashboard-alert"><span className="alert-symbol"><FiShield /></span><div><strong>Your registry connection is active</strong><p>Only bike records linked to your signed-in account appear here.</p></div></div>{error && <p className="auth-error" role="alert">{error}</p>}<div className="dashboard-stats"><div><span>Protected bikes</span><strong>{loading ? '—' : bikes.filter(bike => bike.status === 'protected').length}</strong><small>Live records</small></div><div><span>Reported stolen</span><strong>{loading ? '—' : bikes.filter(bike => bike.status === 'stolen').length}</strong><small>Live records</small></div><div><span>Account status</span><strong className="green-text">Connected</strong><small>Active session</small></div></div><section className="dashboard-section" id="bikes"><div className="section-title"><div><p className="eyebrow dark-eyebrow">Your collection</p><h2>My bikes <span>({bikes.length})</span></h2></div><Link className="text-link dark-link" href="/register?mode=bike">Add a bike <FiPlus /></Link></div>{loading ? <div className="empty-state">Loading your bike records…</div> : bikes.length === 0 ? <div className="empty-state"><h3>No bikes registered yet</h3><p>Register your first bike to create a live ownership record.</p><Link className="button button-green" href="/register?mode=bike">Register a bike <FiPlus /></Link></div> : <div className="bike-table">{bikes.map(bike => <div className="owned-bike" key={bike.$id}><div className="owned-bike-image" style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined} /><div className="owned-bike-info"><span className={bike.status === 'stolen' ? 'status status-stolen' : 'status'}>{bike.status === 'protected' && <FiCheck />} {bike.status}</span><h3>{bike.brand} {bike.model}</h3><p>{bike.year} · {bike.colour}</p><span className="serial">{bike.serialNumber}</span></div><div className="owned-bike-meta"><span>Registered</span><strong>{new Date(bike.createdAt).toLocaleDateString('en-ZA')}</strong><Link href={`/dashboard/bikes/${bike.$id}`}>View record <FiArrowRight /></Link><Link href={`/dashboard/bikes/${bike.$id}?edit=true`}>Edit details</Link><Link href={`/dashboard/transfer?bike=${bike.$id}`}>Transfer ownership</Link></div></div>)}</div>}</section></DemoShell></ProductOnboarding>
}
