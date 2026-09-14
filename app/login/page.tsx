'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { signInWithAppwrite } from '../lib/appwrite/auth'
import { appwriteConfig } from '../lib/appwrite/client'

export default function LoginPage() {
  const [signedIn, setSignedIn] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    if (!appwriteConfig.configured) { setSignedIn(true); return }
    const form = new FormData(event.currentTarget)
    setLoading(true)
    try { await signInWithAppwrite(String(form.get('email') || ''), String(form.get('password') || '')); setSignedIn(true) } catch { setAuthError('We could not sign you in. Check your details and try again.') } finally { setLoading(false) }
  }
  return <DemoShell active="Overview"><div className="auth-layout"><div className="auth-visual"><p className="eyebrow">Your bikes, together</p><h1>One place to<br /><em>look after</em> them.</h1><div className="auth-quote">“I registered my bike once. Now I always know where its record is.”<small>— Kayla, Cape Town</small></div></div><div className="auth-card">{signedIn ? <><span className="success-icon"><FiCheck /></span><h2>Welcome back, Kayla.</h2><p>You&apos;re signed in to your CycleTrace demo account.</p><Link className="button button-green" href="/dashboard">Open dashboard <FiArrowRight /></Link></> : <><p className="eyebrow dark-eyebrow">Member access</p><h2>Welcome back.</h2><p className="form-helper">Sign in to manage your bikes and keep your records up to date.</p><form onSubmit={submit}><label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Password<div className="password-field"><input name="password" required type="password" placeholder="Enter your password" /><button type="button">Show</button></div></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<div className="auth-options"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="mailto:hello@cycletrace.co.za?subject=Reset%20my%20CycleTrace%20password">Forgot password?</a></div><button className="button button-green full-button" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <FiArrowRight /></button></form><div className="auth-divider"><span>or</span></div><p className="auth-switch">New to CycleTrace? <Link href="/register">Create an account</Link></p></>}</div></div></DemoShell>
}
