'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { DemoShell } from '../components/DemoShell'

export default function LoginPage() {
  const [signedIn, setSignedIn] = useState(false)
  function submit(event: FormEvent) { event.preventDefault(); setSignedIn(true) }
  return <DemoShell active="Overview"><div className="auth-layout"><div className="auth-visual"><p className="eyebrow">Your bikes, together</p><h1>One place to<br /><em>look after</em> them.</h1><div className="auth-quote">“I registered my bike once. Now I always know where its record is.”<small>— Kayla, Cape Town</small></div></div><div className="auth-card">{signedIn ? <><span className="success-icon">✓</span><h2>Welcome back, Kayla.</h2><p>You&apos;re signed in to your CycleTrace demo account.</p><Link className="button button-green" href="/dashboard">Open dashboard <span>→</span></Link></> : <><p className="eyebrow dark-eyebrow">Member access</p><h2>Welcome back.</h2><p className="form-helper">Sign in to manage your bikes and keep your records up to date.</p><form onSubmit={submit}><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>Password<div className="password-field"><input required type="password" placeholder="Enter your password" /><button type="button">Show</button></div></label><div className="auth-options"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div><button className="button button-green full-button" type="submit">Sign in <span>→</span></button></form><div className="auth-divider"><span>or</span></div><p className="auth-switch">New to CycleTrace? <Link href="/register">Create an account</Link></p></>}</div></div></DemoShell>
}
