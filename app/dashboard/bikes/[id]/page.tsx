'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiRepeat } from 'react-icons/fi'
import { DemoShell } from '../../../components/DemoShell'
import { BikeRecord, getAppwriteBike } from '../../../lib/appwrite/bikes'

export default function DashboardBikeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [bike, setBike] = useState<BikeRecord | null>()
  useEffect(() => { getAppwriteBike(id).then(setBike) }, [id])
  if (bike === undefined) return <DemoShell showSidebar><div className="empty-state">Loading live record…</div></DemoShell>
  if (!bike) return <DemoShell showSidebar><div className="empty-state"><h3>Bike record not found</h3><Link href="/dashboard">Return to dashboard</Link></div></DemoShell>
  return <DemoShell active="My bikes" showSidebar><Link className="back-link" href="/dashboard#bikes"><FiArrowLeft /> Back to my bikes</Link><div className="workspace-record-heading"><div><p className="eyebrow dark-eyebrow">My bike · {bike.$id.toUpperCase()}</p><h1>Your <span>bike record.</span></h1></div><span className={bike.status === 'stolen' ? 'status status-stolen' : 'status'}>{bike.status === 'protected' && <FiCheck />} {bike.status}</span></div><div className="workspace-record-grid"><div><div className="detail-photo" style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined} /></div><div className="workspace-record-copy"><h2>{bike.brand} {bike.model}</h2><div className="detail-facts"><div><span>Serial number</span><strong>{bike.serialNumber}</strong></div><div><span>Year</span><strong>{bike.year}</strong></div><div><span>Colour</span><strong>{bike.colour}</strong></div><div><span>Location</span><strong>{bike.location}</strong></div></div><div className="record-actions"><Link className="button button-green" href={`/dashboard/transfer?bike=${bike.$id}`}><FiRepeat /> Transfer ownership</Link>{bike.status !== 'stolen' && <Link className="button button-dark" href={`/dashboard/report?bike=${bike.$id}`}><FiAlertTriangle /> Report stolen</Link>}</div></div></div></DemoShell>
}
