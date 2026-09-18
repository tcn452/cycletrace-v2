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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await requestPasswordRecovery(email.trim())
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
        <div className="auth-layout" style={{ maxWidth: '520px', margin: '40px auto' }}>
          <div className="auth-card" style={{ textAlign: 'center', padding: '36px 28px' }}>
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
            <p className="eyebrow dark-eyebrow">Recovery instructions sent</p>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Check your email</h2>
            <p style={{ color: '#6e7772', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              We have sent a secure password reset link to <strong>{email}</strong>. Follow the instructions in the email to set a new password.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link className="button button-green full-button" href="/login" style={{ justifyContent: 'center' }}>
                Return to sign in <FiArrowRight />
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6e7772',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '8px',
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
