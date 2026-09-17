'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FiArrowRight, FiCheck, FiShoppingBag } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'
import { createStoreOwner } from '../../lib/appwrite/store'

export default function StoreOwnerOnboardingPage() {
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await createStoreOwner({ businessName: String(form.get('businessName')), contactName: String(form.get('contactName')), email: String(form.get('email')), phone: String(form.get('phone')), address: String(form.get('address')) }); setComplete(true) } catch { setError('The store profile could not be saved to Appwrite. Confirm that you are signed in.') } }
  if (complete) return <DemoShell showSidebar><div className="success-panel"><span className="success-icon"><FiCheck /></span><h1>Store profile<br /><span>saved.</span></h1><p>Your Appwrite store-owner record is pending verification.</p><Link className="button button-green" href="/store-owner">Open store dashboard <FiArrowRight /></Link></div></DemoShell>
  return <DemoShell showSidebar><div className="role-form-layout"><div className="role-form-intro"><p className="eyebrow dark-eyebrow">Store owner onboarding</p><h1>Turn every<br /><span>sale into trust.</span></h1><div className="role-trust-note"><FiShoppingBag /><span><strong>For bike shops &amp; retailers</strong><small>Saved directly to Appwrite.</small></span></div></div><div className="form-card role-form-card"><form onSubmit={submit}><h2>Create your store profile</h2><label>Business name<input name="businessName" required /></label><label>Store address<input name="address" required /></label><label>Contact name<input name="contactName" required /></label><label>Business email<input name="email" required type="email" /></label><label>Phone number<input name="phone" required type="tel" /></label><label className="check-label"><input type="checkbox" required /> I confirm these details are accurate.</label>{error && <p className="auth-error">{error}</p>}<button className="button button-green" type="submit">Create store profile <FiArrowRight /></button></form></div></div></DemoShell>
}
