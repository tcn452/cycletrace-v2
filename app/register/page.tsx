'use client'

import Link from 'next/link'
import { ChangeEvent, FormEvent, useState } from 'react'
import { FiArrowRight, FiCamera, FiCheck, FiUploadCloud } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { AppwriteException } from 'appwrite'
import { createOrResumeAppwriteAccount } from '../lib/appwrite/auth'
import { createAppwriteBike } from '../lib/appwrite/bikes'

const emptyForm = { brand: '', model: '', year: '', colour: '', serialNumber: '', location: '', ownerName: '', email: '', password: '' }

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [createdBikeId, setCreatedBikeId] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [bikeForm, setBikeForm] = useState(emptyForm)
  const [registrationError, setRegistrationError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field: keyof typeof bikeForm, value: string) { setBikeForm(current => ({ ...current, [field]: value })) }
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10_000_000) { setRegistrationError('The bike photo must be smaller than 10 MB.'); event.target.value = ''; return }
    setPhotoFile(file)
    setPhotoName(file.name)
    setPhotoPreview(URL.createObjectURL(file))
  }
  async function next(event: FormEvent) {
    event.preventDefault()
    setRegistrationError('')
    if (step < 3) { setStep(step + 1); return }
    if (!photoFile) { setRegistrationError('Please add a clear photo of your bike.'); return }
    setSaving(true)
    try {
      await createOrResumeAppwriteAccount(bikeForm.email, bikeForm.password, bikeForm.ownerName)
      const bike = await createAppwriteBike({ brand: bikeForm.brand, model: bikeForm.model, year: Number(bikeForm.year), colour: bikeForm.colour, serialNumber: bikeForm.serialNumber, location: bikeForm.location, status: 'protected', createdAt: new Date().toISOString(), photo: photoFile })
      setCreatedBikeId(bike.$id)
    } catch (error) {
      console.error('[bike-registration] failed', error)
      if (error instanceof AppwriteException) {
        if (error.code === 401) setRegistrationError('Your session or password was not accepted. Sign in again and retry the registration.')
        else if (error.code === 409) setRegistrationError('That serial number or account is already registered. Sign in to view the existing record.')
        else if (error.code === 413) setRegistrationError('The bike photo is too large. Choose a smaller image and try again.')
        else setRegistrationError(`Appwrite could not save the bike: ${error.message}`)
      } else setRegistrationError(error instanceof Error ? error.message : 'We could not save the bike. Check your details and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (createdBikeId) return <DemoShell active="My bikes"><div className="success-panel"><span className="success-icon"><FiCheck /></span><p className="eyebrow dark-eyebrow">Bike registered</p><h1>Your bike is now<br /><span>on the map.</span></h1><p>The live Appwrite record for {bikeForm.brand} {bikeForm.model} has been created.</p><div className="success-code">REGISTRATION ID <strong>{createdBikeId}</strong></div><div className="success-actions"><Link className="button button-green" href="/dashboard">Go to my dashboard <FiArrowRight /></Link><Link className="text-link dark-link" href={`/bikes/${createdBikeId}`}>View public record <FiArrowRight /></Link></div></div></DemoShell>

  return <DemoShell active="My bikes"><div className="form-layout"><div className="form-intro"><p className="eyebrow dark-eyebrow">Protect your ride</p><h1>Register a<br /><span>bike.</span></h1><p>Create a live ownership record in CycleTrace.</p></div><div className="form-card"><div className="form-progress"><span className="active">01 Bike details</span><span className={step > 1 ? 'active' : ''}>02 Ownership</span><span className={step > 2 ? 'active' : ''}>03 Review</span></div><form onSubmit={next}>
    {step === 1 && <><h2>Tell us about your bike</h2><p className="form-helper">Enter the identifying details exactly as they appear on the bike.</p><div className="field-grid"><label>Brand<input required value={bikeForm.brand} onChange={e => update('brand', e.target.value)} placeholder="e.g. Specialized" /></label><label>Model<input required value={bikeForm.model} onChange={e => update('model', e.target.value)} placeholder="e.g. Allez Sport" /></label><label>Year<input required type="number" min="1900" max={new Date().getFullYear() + 1} value={bikeForm.year} onChange={e => update('year', e.target.value)} placeholder="2024" /></label><label>Colour<input required value={bikeForm.colour} onChange={e => update('colour', e.target.value)} placeholder="Frame colour" /></label></div><label>Serial number<input required value={bikeForm.serialNumber} onChange={e => update('serialNumber', e.target.value)} placeholder="Find this stamped on the frame" /></label><label className="photo-upload"><span className="photo-upload-preview">{photoPreview ? <img src={photoPreview} alt="Selected bike" /> : <FiCamera />}</span><span><strong>{photoName || 'Add a clear photo of your bike'}</strong><small>Include the frame and identifying details</small></span><input required type="file" accept="image/*" capture="environment" onChange={selectPhoto} /><FiUploadCloud /></label></>}
    {step === 2 && <><h2>Confirm ownership</h2><p className="form-helper">Your account will be created in Appwrite.</p><label>Full name<input required value={bikeForm.ownerName} onChange={e => update('ownerName', e.target.value)} /></label><label>Email address<input required type="email" autoComplete="email" value={bikeForm.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" /></label><label>Password<input required minLength={8} type="password" autoComplete="new-password" value={bikeForm.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" /></label><label>Where do you keep your bike?<input required value={bikeForm.location} onChange={e => update('location', e.target.value)} placeholder="City or suburb" /></label><label className="check-label"><input type="checkbox" required /> I confirm that I own this bike and the details are accurate.</label></>}
    {step === 3 && <><h2>Review your record</h2><div className="review-list"><div><span>Bike</span><strong>{bikeForm.brand} {bikeForm.model}</strong></div><div><span>Serial number</span><strong>{bikeForm.serialNumber}</strong></div><div><span>Bike photo</span><strong>{photoName}</strong></div><div><span>Owner</span><strong>{bikeForm.ownerName}</strong></div><div><span>Record status</span><strong>Protected</strong></div></div><label className="check-label"><input type="checkbox" required /> I agree to the CycleTrace terms and privacy policy.</label></>}
    {registrationError && <p className="auth-error" role="alert">{registrationError}</p>}<div className="form-actions"><button className="button button-green" type="submit" disabled={saving}>{saving ? 'Saving to Appwrite…' : step === 3 ? 'Complete registration' : 'Continue'} <FiArrowRight /></button>{step > 1 && !saving && <button type="button" className="text-button" onClick={() => setStep(step - 1)}>Back</button>}</div>
  </form></div></div></DemoShell>
}
