'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import {
  FiAlertTriangle,
  FiCheck,
  FiCreditCard,
  FiKey,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
} from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { useAuth } from '../lib/appwrite/AuthContext'
import {
  getCurrentAppwriteUser,
  updateAppwritePassword,
  updateAppwriteProfile,
} from '../lib/appwrite/auth'

export default function SettingsPage() {
  const { logout, refresh } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  // Profile form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Security form state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securitySaving, setSecuritySaving] = useState(false)
  const [securitySaved, setSecuritySaved] = useState(false)
  const [securityError, setSecurityError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#security') {
      setActiveTab('security')
    }

    getCurrentAppwriteUser()
      .then(user => {
        if (!user) {
          setProfileError('Sign in to manage your settings.')
          return
        }
        setName(user.name || '')
        setEmail(user.email || '')
        const prefs = (user.prefs as Record<string, unknown>) || {}
        setCity(String(prefs.city || ''))
        setPhone(String(prefs.phone || user.phone || ''))
      })
      .catch(() => {
        setProfileError('Could not load your profile details.')
      })
  }, [])

  async function handleProfileSave(event: FormEvent) {
    event.preventDefault()
    setProfileError('')
    setProfileSaved(false)
    setProfileSaving(true)

    try {
      await updateAppwriteProfile(name, {
        city: city.trim(),
        phone: phone.trim(),
      })
      await refresh()
      setProfileSaved(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Your profile could not be updated.'
      setProfileError(message)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSave(event: FormEvent) {
    event.preventDefault()
    setSecurityError('')
    setSecuritySaved(false)

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('The new passwords do not match.')
      return
    }

    setSecuritySaving(true)
    try {
      await updateAppwritePassword(newPassword, oldPassword || undefined)
      setSecuritySaved(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not change password. Check your current password and try again.'
      setSecurityError(message)
    } finally {
      setSecuritySaving(false)
    }
  }

  return (
    <DemoShell active="Settings" showSidebar>
      <div className="settings-heading">
        <div>
          <p className="eyebrow dark-eyebrow">Account settings</p>
          <h1>
            Make it
            <br />
            <span>your account.</span>
          </h1>
          <p>Manage your contact details, location, and account security.</p>
        </div>
        <Link className="button button-dark" href="/settings/billing">
          <FiCreditCard /> Manage billing
        </Link>
      </div>

      <div className="settings-layout">
        <aside className="settings-tabs">
          <button
            type="button"
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => {
              setActiveTab('profile')
              if (typeof window !== 'undefined') window.location.hash = '#profile'
            }}
          >
            <FiUser /> Profile
          </button>
          <button
            type="button"
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => {
              setActiveTab('security')
              if (typeof window !== 'undefined') window.location.hash = '#security'
            }}
          >
            <FiLock /> Security
          </button>
        </aside>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <form className="settings-card" id="profile" onSubmit={handleProfileSave}>
              <div className="settings-card-heading">
                <div>
                  <p className="eyebrow dark-eyebrow">Personal profile</p>
                  <h2>Your details</h2>
                </div>
                <span className="saved-note">
                  {profileSaved && (
                    <>
                      <FiCheck /> Changes saved
                    </>
                  )}
                </span>
              </div>

              {profileSaved && (
                <div className="alert-box alert-success" role="status">
                  <strong>
                    <FiCheck /> Profile updated
                  </strong>
                  <p>Your name, phone number, and home city have been updated successfully.</p>
                </div>
              )}

              {profileError && (
                <p className="auth-error" role="alert">
                  {profileError}
                </p>
              )}

              <label>
                Full name
                <input
                  required
                  value={name}
                  onChange={event => {
                    setName(event.target.value)
                    setProfileSaved(false)
                  }}
                  placeholder="Enter your full name"
                />
              </label>

              <label>
                Email address
                <span className="field-badge">(Account ID)</span>
                <input type="email" value={email} disabled title="Primary account email is fixed." />
              </label>

              <label>
                Phone number
                <span className="field-hint">
                  <FiPhone /> For urgent theft alerts &amp; ownership verification
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={event => {
                    setPhone(event.target.value)
                    setProfileSaved(false)
                  }}
                  placeholder="e.g. 082 123 4567 or +27 82 123 4567"
                />
              </label>

              <label>
                Home city
                <span className="field-hint">
                  <FiMapPin /> Primary city &amp; province for regional registry alerts
                </span>
                <input
                  value={city}
                  onChange={event => {
                    setCity(event.target.value)
                    setProfileSaved(false)
                  }}
                  placeholder="e.g. Cape Town, Western Cape"
                />
              </label>

              <div className="settings-actions">
                <button
                  className="button button-green"
                  type="submit"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving changes…' : 'Save changes'} <FiCheck />
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <>
              <form className="settings-card" id="security" onSubmit={handlePasswordSave}>
                <div className="settings-card-heading">
                  <div>
                    <p className="eyebrow dark-eyebrow">Password &amp; Credentials</p>
                    <h2>Change password</h2>
                  </div>
                  <span className="settings-security-badge">
                    <FiShield /> TLS Encrypted
                  </span>
                </div>

                {securitySaved && (
                  <div className="alert-box alert-success" role="status">
                    <strong>
                      <FiCheck /> Password updated
                    </strong>
                    <p>Your account password has been changed successfully.</p>
                  </div>
                )}

                {securityError && (
                  <div className="alert-box alert-danger" role="alert">
                    <strong>
                      <FiAlertTriangle /> Password update error
                    </strong>
                    <p>{securityError}</p>
                  </div>
                )}

                <label>
                  Current password
                  <span className="field-hint">Enter your existing account password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={oldPassword}
                    onChange={e => {
                      setOldPassword(e.target.value)
                      setSecuritySaved(false)
                    }}
                    placeholder="Enter current password"
                  />
                </label>

                <label>
                  New password
                  <span className="field-hint">Must be at least 8 characters</span>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value)
                      setSecuritySaved(false)
                    }}
                    placeholder="Enter new password (min. 8 characters)"
                  />
                </label>

                <label>
                  Confirm new password
                  <span className="field-hint">Re-enter your new password to confirm</span>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value)
                      setSecuritySaved(false)
                    }}
                    placeholder="Repeat new password"
                  />
                </label>

                <div className="settings-actions">
                  <button
                    className="button button-green"
                    type="submit"
                    disabled={securitySaving}
                  >
                    {securitySaving ? 'Updating password…' : 'Update password'} <FiKey />
                  </button>
                </div>
              </form>

              <section className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <p className="eyebrow dark-eyebrow">Session Management</p>
                    <h2>Active session</h2>
                  </div>
                  <span className="status">
                    <FiCheck /> Active
                  </span>
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Encrypted Session Connection</strong>
                    <p>
                      Protected with enterprise TLS 1.3 / AES-256 session encryption.
                      Signed in as <strong>{email}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => logout()}
                  >
                    <FiLogOut /> Sign out
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  )
}

