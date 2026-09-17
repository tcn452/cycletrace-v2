'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { FiArrowRight, FiCheck, FiSearch } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { BikeRecord, searchAppwriteBikes } from '../lib/appwrite/bikes'
import { getInsurerWorkspace } from '../lib/appwrite/insurer'

type Workspace = Awaited<ReturnType<typeof getInsurerWorkspace>>

export default function InsurerPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BikeRecord[]>([])
  const [searched, setSearched] = useState(false)
  useEffect(() => { getInsurerWorkspace().then(setWorkspace).catch(() => setWorkspace(null)) }, [])
  async function search(event: FormEvent) { event.preventDefault(); setResults(await searchAppwriteBikes(query)); setSearched(true) }
  if (workspace === undefined) return <DemoShell showSidebar><div className="empty-state">Loading insurer records from Appwrite…</div></DemoShell>
  if (!workspace) return <DemoShell showSidebar><div className="empty-state"><h3>Sign in to an insurer account</h3><p>This workspace requires an Appwrite insurer membership.</p><Link className="button button-green" href="/login">Sign in</Link></div></DemoShell>
  if (!workspace.member) return <DemoShell showSidebar><div className="empty-state"><h3>No insurer membership found</h3><p>Your Appwrite user is not linked to an insurer organization.</p><Link className="button button-green" href="/insurer/onboarding">Request insurer access</Link></div></DemoShell>
  const orgName = workspace.organization?.name || 'Insurer workspace'
  const openClaims = workspace.claims.filter(claim => ['open', 'in_review'].includes(claim.status))
  const confidence = workspace.checks.length ? Math.round(workspace.checks.reduce((sum, check) => sum + check.confidence, 0) / workspace.checks.length) : 0
  return <DemoShell active="Overview" showSidebar><div className="insurer-heading"><div><p className="eyebrow dark-eyebrow">Partner workspace · {orgName}</p><h1>Live insurer<br /><span>records.</span></h1></div><div className="insurer-account"><span className="insurer-logo">{orgName.slice(0, 2).toUpperCase()}</span><span><strong>{orgName}</strong><small>{workspace.member.role}</small></span></div></div><div className="insurer-banner"><div><span className="live-label"><i /> Appwrite connected</span><h2>Coverage decisions,<br /><em>with live context.</em></h2></div><Link className="button button-green" href="#lookup">Verify a bike <FiSearch /></Link></div><div className="insurer-stats"><div><span>Covered bikes</span><strong>{workspace.policies.length}</strong><small>Live policies</small></div><div><span>Verification checks</span><strong>{workspace.checks.length}</strong><small>Appwrite records</small></div><div><span>Open claims</span><strong>{openClaims.length}</strong><small>Need attention</small></div><div><span>Match confidence</span><strong>{confidence}%</strong><small>Recorded checks</small></div></div><section className="lookup-panel" id="lookup"><div><p className="eyebrow dark-eyebrow">Instant verification</p><h2>Look up a <span>bike record.</span></h2></div><form onSubmit={search}><label htmlFor="insurer-search">Serial number, brand or model</label><div className="lookup-input"><input required id="insurer-search" value={query} onChange={event => setQuery(event.target.value)} /><button className="button button-green" type="submit">Verify record <FiArrowRight /></button></div>{searched && results.length === 0 && <div className="lookup-result">No matching live record.</div>}{results.map(bike => <div className="lookup-result" key={bike.$id}><span className="status"><FiCheck /> {bike.status}</span><strong>{bike.brand} {bike.model} · {bike.serialNumber}</strong><Link href={`/bikes/${bike.$id}`}>View full record →</Link></div>)}</form></section><section className="insurer-table-section"><div className="section-title"><div><p className="eyebrow dark-eyebrow">Your portfolio</p><h2>Insured <span>bikes.</span></h2></div></div>{workspace.policies.length === 0 ? <div className="empty-state">No policies are linked to this organization yet.</div> : <div className="insurer-table"><div className="insurer-table-head"><span>POLICY / BIKE</span><span>STATUS</span><span>VALUE</span><span>LAST VERIFIED</span><span /></div>{workspace.policies.map(policy => <div className="insurer-row" key={policy.$id}><div><strong>{policy.policyNumber}</strong><small>{policy.bikeId}</small></div><span className="status">{policy.status}</span><strong>R{policy.insuredValue.toLocaleString('en-ZA')}</strong><span>{policy.verifiedAt ? new Date(policy.verifiedAt).toLocaleDateString('en-ZA') : 'Not verified'}</span><Link href={`/bikes/${policy.bikeId}`}>→</Link></div>)}</div>}</section></DemoShell>
}
