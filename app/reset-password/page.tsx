'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { FiArrowRight, FiCheck, FiLock } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { resetPasswordWithRecovery } from '../lib/appwrite/auth'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || ''
  const secret = searchParams.get('secret') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!userId || !secret) {
    return (
      <div className="auth-card" style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center', padding: '36px 28px' }}>
        <p className="eyebrow dark-eyebrow">Invalid Recovery Link</p>
        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Link expired or invalid</h2>
        <p style={{ color: '#6e7772', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          This password reset link is missing required verification credentials or has expired. Please request a new recovery link.
        </p>
        <Link className="button button-green full-button" href="/forgot-password" style={{ justifyContent: 'center' }}>
          Request new reset link <FiArrowRight />
        </Link>
      </div>
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordWithRecovery({ userId, secret, password })
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The link may have expired. Please request a new one.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-card" style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center', padding: '36px 28px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            background: '#eefbf3',
            color: '#167240',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}
        >
          <FiCheck />
        </div>
        <p className="eyebrow dark-eyebrow">Password Updated</p>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>You&apos;re all set!</h2>
        <p style={{ color: '#6e7772', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
          Your password has been successfully reset. You can now sign in to your CycleTrace account with your new credentials.
        </p>
        <Link className="button button-green full-button" href="/login" style={{ justifyContent: 'center' }}>
          Sign in with new password <FiArrowRight />
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <p className="eyebrow">Account Security</p>
        <h1>
          Set your new
          <br />
          <em>password</em>.
        </h1>
        <p>Choose a secure password with at least 8 characters to protect your bicycle ownership records.</p>
      </div>
      <div className="auth-card">
        <p className="eyebrow dark-eyebrow">Secure update</p>
        <h2>Set new password</h2>
        <p className="form-helper">Enter and confirm your new password below.</p>

        <form onSubmit={submit}>
          <label>
            New password
            <input
              name="password"
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm new password
            <input
              name="confirmPassword"
              required
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button button-green full-button"
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Updating password…' : 'Reset password'} <FiLock style={{ marginLeft: '6px' }} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <DemoShell active="Overview">
      <Suspense fallback={<div className="empty-state">Loading password reset…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </DemoShell>
  )
}
