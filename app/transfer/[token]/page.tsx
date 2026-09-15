'use client'

import Link from 'next/link'
import { FormEvent, use, useState } from 'react'
import { FiArrowRight, FiCheck, FiShield } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'

export default function AcceptTransferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [email, setEmail] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function accept(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    try { const response = await fetch('/api/ownership-transfers/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, email }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setAccepted(true) } catch (acceptError) { setError(acceptError instanceof Error ? acceptError.message : 'Unable to accept this transfer.') } finally { setLoading(false) }
  }
  if (accepted) return <DemoShell><div className="success-panel"><span className="success-icon"><FiCheck /></span><p className="eyebrow dark-eyebrow">Ownership accepted</p><h1>The bike is now<br /><span>yours to protect.</span></h1><p>The ownership record has been updated. Sign in with the recipient email to see the bike in your dashboard.</p><Link className="button button-green" href="/login">Sign in to my dashboard <FiArrowRight /></Link></div></DemoShell>
  return <DemoShell><div className="transfer-accept-layout"><div className="transfer-accept-visual"><span className="transfer-accept-icon"><FiShield /></span><p className="eyebrow">Ownership transfer</p><h1>A bike is<br /><em>coming your way.</em></h1><p>Accept the transfer to make the bike part of your CycleTrace ownership record.</p></div><div className="form-card"><h2>Confirm your email</h2><p className="form-helper">Use the email address this transfer was sent to.</p><form onSubmit={accept}><label>Email address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-green full-button" type="submit" disabled={loading}>{loading ? 'Accepting…' : 'Accept ownership'} <FiArrowRight /></button></form><p className="form-footnote">By accepting, you confirm that the sender has legitimately transferred this bike to you.</p></div></div></DemoShell>
}
