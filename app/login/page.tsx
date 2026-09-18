'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { useAuth } from '../lib/appwrite/AuthContext'
import { signInWithAppwrite } from '../lib/appwrite/auth'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, refresh } = useAuth()
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    const form = new FormData(event.currentTarget)
    setLoading(true)
    try {
      await signInWithAppwrite(String(form.get('email') || ''), String(form.get('password') || ''))
      await refresh()
      router.push('/dashboard')
    } catch {
      setAuthError('We could not sign you in. Check your details and try again.')
      setLoading(false)
    }
  }

  if (authLoading || user) {
    return (
      <DemoShell active="Overview">
        <div className="empty-state">
          <p>Checking authentication…</p>
        </div>
      </DemoShell>
    )
  }

  return <DemoShell active="Overview"><div className="auth-layout"><div className="auth-visual"><p className="eyebrow">Your bikes, together</p><h1>One place to<br /><em>look after</em> them.</h1><p>Sign in to view your protected bike records.</p></div><div className="auth-card"><p className="eyebrow dark-eyebrow">Member access</p><h2>Welcome back.</h2><p className="form-helper">Sign in to manage your bikes and keep your records current.</p><form onSubmit={submit}><label>Email address<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label><label>Password<input name="password" required type="password" autoComplete="current-password" placeholder="Enter your password" /></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button className="button button-green full-button" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <FiArrowRight /></button></form><div className="auth-divider"><span>or</span></div><p className="auth-switch">New to CycleTrace? <Link href="/register">Create an account</Link></p></div></div></DemoShell>
}
