'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { FiCheck, FiCreditCard, FiLock, FiUser } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { getCurrentAppwriteUser, updateAppwriteProfile } from '../lib/appwrite/auth'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { getCurrentAppwriteUser().then(user => { if (!user) { setError('Sign in to manage your settings.'); return } setName(user.name); setEmail(user.email); setCity(String(user.prefs.city || '')); setPhone(String(user.prefs.phone || '')) }) }, [])
  async function save(event: FormEvent) { event.preventDefault(); setError(''); try { await updateAppwriteProfile(name, { city, phone }); setSaved(true) } catch { setError('Your Appwrite profile could not be updated.') } }
  return <DemoShell active="Settings" showSidebar><div className="settings-heading"><div><p className="eyebrow dark-eyebrow">Account settings</p><h1>Make it<br /><span>your account.</span></h1><p>These details are loaded from and saved to Appwrite.</p></div><Link className="button button-dark" href="/settings/billing"><FiCreditCard /> Manage billing</Link></div><div className="settings-layout"><aside className="settings-tabs"><a className="active" href="#profile"><FiUser /> Profile</a><a href="#security"><FiLock /> Security</a></aside><div className="settings-content"><form className="settings-card" id="profile" onSubmit={save}><div className="settings-card-heading"><div><p className="eyebrow dark-eyebrow">Personal profile</p><h2>Your details</h2></div><span className="saved-note">{saved && <><FiCheck /> Saved to Appwrite</>}</span></div><label>Full name<input required value={name} onChange={event => setName(event.target.value)} /></label><label>Email address<input type="email" value={email} disabled /></label><label>Phone number<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label><label>Home city<input value={city} onChange={event => setCity(event.target.value)} /></label>{error && <p className="auth-error" role="alert">{error}</p>}<div className="settings-actions"><button className="button button-green" type="submit">Save changes <FiCheck /></button></div></form><section className="settings-card" id="security"><div className="settings-card-heading"><div><p className="eyebrow dark-eyebrow">Account protection</p><h2>Security</h2></div><span className="status"><FiCheck /> Appwrite Auth</span></div><p>Password and session security are managed by Appwrite.</p></section></div></div></DemoShell>
}
