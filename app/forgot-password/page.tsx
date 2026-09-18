'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCheck, FiMail } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { requestPasswordRecovery } from '../lib/appwrite/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [recoveryToken, setRecoveryToken] = useState<{ userId?: string; secret?: string } | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await requestPasswordRecovery(email.trim())
      if (res && typeof res === 'object') {
        const anyRes = res as { userId?: string; secret?: string }
        if (anyRes.userId && anyRes.secret) {
          setRecoveryToken({ userId: anyRes.userId, secret: anyRes.secret })
        }
      }
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send password recovery email. Please check the email address and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <DemoShell active="Overview">
        <div className="auth-layout">
          <div className="auth-visual">
            <p className="eyebrow">Account Security</p>
            <h1>
              Check your
              <br />
              <em>inbox</em> now.
            </h1>
            <p>We&apos;ve dispatched secure password recovery instructions to your email.</p>
          </div>
          <div className="auth-card">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#eefbf3',
                color: '#167240',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '24px',
              }}
            >
              <FiCheck />
            </div>
            <p className="eyebrow dark-eyebrow">Recovery instructions sent</p>
            <h2 style={{ fontSize: '26px', marginBottom: '10px' }}>Check your email</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              We have sent a secure password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder) and click the link to choose a new password.
            </p>

            <div
              style={{
                background: '#f8faf9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '24px',
                textAlign: 'left',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#121b18', marginBottom: '6px' }}>
                Next steps:
              </p>
              <ul style={{ fontSize: '12px', color: '#4b5563', paddingLeft: '18px', margin: 0, lineHeight: '1.6' }}>
                <li>Click the reset link in your email to open the reset form.</li>
                <li>Choose a secure new password (minimum 8 characters).</li>
                <li>Once updated, sign in with your new password.</li>
              </ul>
            </div>

            {recoveryToken?.userId && recoveryToken?.secret && (
              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderLeft: '4px solid #ca8a04',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginBottom: '20px',
                  fontSize: '12px',
                  textAlign: 'left',
                  color: '#713f12',
                }}
              >
                <strong>Evaluation / Direct Link:</strong>
                <p style={{ margin: '4px 0 6px', fontSize: '11.5px' }}>
                  If testing locally or without SMTP mail delivery:
                </p>
                <Link
                  href={`/reset-password?userId=${encodeURIComponent(recoveryToken.userId)}&secret=${encodeURIComponent(recoveryToken.secret)}`}
                  style={{ color: '#854d0e', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Click here to proceed to reset password →
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link className="button button-green full-button" href="/login" style={{ justifyContent: 'center' }}>
                Return to sign in <FiArrowRight />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setRecoveryToken(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px',
                  textDecoration: 'underline',
                }}
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          </div>
        </div>
      </DemoShell>
    )
  }

  return (
    <DemoShell active="Overview">
      <div className="auth-layout">
        <div className="auth-visual">
          <p className="eyebrow">Account Security</p>
          <h1>
            Reset your
            <br />
            <em>password</em> safely.
          </h1>
          <p>Enter your registered account email to receive a secure recovery link.</p>
        </div>
        <div className="auth-card">
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6e7772',
              marginBottom: '16px',
            }}
          >
            <FiArrowLeft /> Back to sign in
          </Link>
          <p className="eyebrow dark-eyebrow">Password Recovery</p>
          <h2>Forgot your password?</h2>
          <p className="form-helper">
            Enter the email address associated with your CycleTrace account and we will send you a reset link.
          </p>

          <form onSubmit={submit}>
            <label>
              Account email address
              <input
                name="email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              disabled={loading || !email.trim()}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Sending link…' : 'Send reset link'} <FiMail style={{ marginLeft: '6px' }} />
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Remembered your password? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </DemoShell>
  )
}
