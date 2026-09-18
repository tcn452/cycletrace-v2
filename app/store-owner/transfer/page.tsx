'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiFileText,
  FiLock,
  FiPrinter,
  FiShare2,
  FiShield,
  FiShoppingBag,
} from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'
import { BikeRecord } from '../../lib/appwrite/bikes'
import { getStoreWorkspace } from '../../lib/appwrite/store'
import { createStoreStockTransfer, OwnershipTransfer } from '../../lib/appwrite/transfers'

function StoreTransferContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBikeId = searchParams.get('bikeId') || ''

  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<Awaited<ReturnType<typeof getStoreWorkspace>> | null>(null)
  const [selectedBikeId, setSelectedBikeId] = useState(preselectedBikeId)
  const [bikerName, setBikerName] = useState('')
  const [bikerEmail, setBikerEmail] = useState('')
  const [bikerPhone, setBikerPhone] = useState('')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [handoverDate, setHandoverDate] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [completedTransfer, setCompletedTransfer] = useState<OwnershipTransfer | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    getStoreWorkspace()
      .then((ws) => {
        setWorkspace(ws)
        if (ws?.bikes && ws.bikes.length > 0) {
          if (!selectedBikeId || !ws.bikes.some((b) => b.$id === selectedBikeId)) {
            const firstAvailable = ws.bikes.find((b) => b.status !== 'transferred' && b.status !== 'stolen')
            if (firstAvailable) setSelectedBikeId(firstAvailable.$id)
          }
        }
      })
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div className="empty-state">Loading shop inventory…</div>
      </DemoShell>
    )
  }

  if (!workspace || !workspace.store) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div className="empty-state">
          <h3>Store profile not found</h3>
          <p>Please register your bicycle retailer profile before accessing inventory transfers.</p>
          <Link className="button button-green" href="/store-owner/onboarding">
            Create store profile
          </Link>
        </div>
      </DemoShell>
    )
  }

  const { store, bikes } = workspace
  const isVerified = store.status === 'verified'

  if (!isVerified) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div className="empty-state" style={{ maxWidth: '520px', margin: '40px auto', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: '#fff0e9',
              color: '#a84a2d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}
          >
            <FiLock />
          </div>
          <h2>Store Verification Required</h2>
          <p style={{ color: '#6e7772', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
            Stock transfers and customer handovers are locked until your shop profile is approved by CycleTrace administrators.
          </p>
          <Link className="button button-dark" href="/store-owner">
            <FiArrowLeft /> Return to store workspace
          </Link>
        </div>
      </DemoShell>
    )
  }

  const availableBikes = bikes.filter((b) => b.status !== 'transferred')
  const selectedBike = bikes.find((b) => b.$id === selectedBikeId)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedBike) {
      setError('Please select a bicycle from your shop inventory.')
      return
    }

    if (!bikerName.trim() || !bikerEmail.trim()) {
      setError('Please provide the buyer full name and email address.')
      return
    }

    setBusy(true)
    try {
      const transfer = await createStoreStockTransfer({
        bikeId: selectedBike.$id,
        storeId: store.$id,
        storeName: store.businessName,
        toName: bikerName.trim(),
        toEmail: bikerEmail.trim().toLowerCase(),
        toPhone: bikerPhone.trim(),
        invoiceRef: invoiceRef.trim() || `INV-${Date.now().toString(36).toUpperCase()}`,
        notes: notes.trim(),
        bikeSummary: {
          brand: selectedBike.brand,
          model: selectedBike.model,
          year: selectedBike.year,
          colour: selectedBike.colour,
          serialNumber: selectedBike.serialNumber,
          image: selectedBike.image,
        },
      })
      setCompletedTransfer(transfer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete stock ownership transfer.')
    } finally {
      setBusy(false)
    }
  }

  function handleCopyClaimLink() {
    if (!completedTransfer) return
    const link = `${window.location.origin}/transfer/${completedTransfer.transferToken}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  // SUCCESS CONFIRMATION & CERTIFICATE VIEW
  if (completedTransfer) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div style={{ maxWidth: '680px', margin: '30px auto' }}>
          <div
            className="success-panel"
            style={{
              padding: '36px 30px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #dce4e0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '30px',
                background: '#eefbf3',
                color: '#167240',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              <FiCheck />
            </div>
            <p className="eyebrow dark-eyebrow">Verified Paper Trail Created</p>
            <h1 style={{ fontSize: '26px', margin: '0 0 8px 0' }}>
              Ownership Transferred
              <br />
              <span>to Customer.</span>
            </h1>
            <p style={{ color: '#6e7772', fontSize: '14px', lineHeight: '1.5' }}>
              The bicycle has been successfully transferred from <strong>{store.businessName}</strong> to{' '}
              <strong>{completedTransfer.toName}</strong> ({completedTransfer.toEmail}).
            </p>

            {/* Paper Trail Certificate Summary Box */}
            <div
              style={{
                background: '#f8faf9',
                borderRadius: '12px',
                padding: '20px',
                margin: '24px 0',
                textAlign: 'left',
                border: '1px solid #e1e7e4',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #edf0ee', paddingBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#173426', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiShield style={{ color: '#167240' }} /> Digital Handover Certificate
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#167240', background: '#eefbf3', padding: '3px 8px', borderRadius: '4px' }}>
                  {completedTransfer.certificateNumber}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#6e7772', fontSize: '11px', display: 'block' }}>Bicycle</span>
                  <strong>{completedTransfer.bikeSummary?.brand} {completedTransfer.bikeSummary?.model}</strong>
                  <small style={{ display: 'block', color: '#6e7772' }}>Serial: {completedTransfer.bikeSummary?.serialNumber}</small>
                </div>
                <div>
                  <span style={{ color: '#6e7772', fontSize: '11px', display: 'block' }}>New Owner (Biker)</span>
                  <strong>{completedTransfer.toName}</strong>
                  <small style={{ display: 'block', color: '#6e7772' }}>{completedTransfer.toEmail}</small>
                </div>
                <div>
                  <span style={{ color: '#6e7772', fontSize: '11px', display: 'block' }}>Store Invoice Ref</span>
                  <strong style={{ fontFamily: 'monospace' }}>{completedTransfer.invoiceRef || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: '#6e7772', fontSize: '11px', display: 'block' }}>Date of Handover</span>
                  <strong>{new Date(completedTransfer.createdAt).toLocaleDateString('en-ZA')}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                className="button button-green full-button"
                href={`/store-owner/transfers/${completedTransfer.$id}/certificate`}
                style={{ justifyContent: 'center', height: '48px', fontSize: '15px' }}
              >
                <FiPrinter /> View &amp; Print Official Handover Certificate
              </Link>

              <button
                type="button"
                onClick={handleCopyClaimLink}
                className="button full-button"
                style={{
                  justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid #cbd5cf',
                  color: '#173426',
                  height: '44px',
                  fontSize: '14px',
                }}
              >
                <FiCopy /> {copiedLink ? 'Recipient Claim Link Copied!' : 'Copy Customer Transfer Link'}
              </button>

              <Link
                className="button full-button"
                href="/store-owner"
                style={{
                  justifyContent: 'center',
                  background: '#f0f4f2',
                  border: '1px solid #dce4e0',
                  color: '#4f5d56',
                  height: '42px',
                  fontSize: '14px',
                }}
              >
                <FiArrowLeft /> Return to Store Workspace
              </Link>
            </div>
          </div>
        </div>
      </DemoShell>
    )
  }

  // MAIN TRANSFER FORM
  return (
    <DemoShell active="Overview" showSidebar>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/store-owner"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6e7772',
              marginBottom: '12px',
            }}
          >
            <FiArrowLeft /> Back to store workspace
          </Link>
          <p className="eyebrow dark-eyebrow">Shop Stock Handover · {store.businessName}</p>
          <h1>
            Transfer stock to
            <br />
            <span>customer / biker.</span>
          </h1>
          <p style={{ color: '#6e7772', fontSize: '14px' }}>
            Transfer a bicycle from your retailer stock to the customer, generating a verified digital paper trail and ownership certificate.
          </p>
        </div>

        {availableBikes.length === 0 ? (
          <div className="form-card" style={{ background: '#ffffff', padding: '36px', borderRadius: '16px', textAlign: 'center', border: '1px solid #dce2df' }}>
            <FiShoppingBag style={{ fontSize: '36px', color: '#6e7772', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>No available inventory in shop stock</h2>
            <p style={{ color: '#6e7772', fontSize: '14px', marginBottom: '20px' }}>
              You do not have any bicycles in stock ready to transfer. Register stock bicycles first.
            </p>
            <Link className="button button-green" href="/store-owner/register">
              Register stock bike <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="form-card" style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #dce2df' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#173426' }}>
                  1. Select bicycle from store stock
                </label>
                <select
                  required
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5cf',
                    background: '#ffffff',
                    fontSize: '14px',
                  }}
                >
                  {availableBikes.map((b) => (
                    <option key={b.$id} value={b.$id}>
                      {b.brand} {b.model} ({b.year}) · Serial: {b.serialNumber} · {b.colour}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBike && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: '#f8faf9',
                    borderRadius: '10px',
                    border: '1px solid #e2e8e4',
                  }}
                >
                  {selectedBike.image ? (
                    <img
                      src={selectedBike.image}
                      alt={selectedBike.brand}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: '#e8eeea', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#173426' }}>
                      <FiShoppingBag />
                    </div>
                  )}
                  <div>
                    <strong style={{ fontSize: '15px', color: '#173426' }}>{selectedBike.brand} {selectedBike.model}</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6e7772' }}>
                      Frame Serial: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedBike.serialNumber}</span> · {selectedBike.colour}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #edf0ee', paddingTop: '16px' }}>
                <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#173426' }}>
                  2. Biker / Customer Details (Recipient)
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label>
                    Buyer full name
                    <input
                      required
                      placeholder="e.g. Sipho Nkosi"
                      value={bikerName}
                      onChange={(e) => setBikerName(e.target.value)}
                    />
                  </label>
                  <label>
                    Buyer email address
                    <input
                      required
                      type="email"
                      placeholder="e.g. sipho@example.co.za"
                      value={bikerEmail}
                      onChange={(e) => setBikerEmail(e.target.value)}
                    />
                  </label>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label>
                    Buyer phone number
                    <input
                      type="tel"
                      placeholder="e.g. +27 82 000 0000"
                      value={bikerPhone}
                      onChange={(e) => setBikerPhone(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #edf0ee', paddingTop: '16px' }}>
                <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#173426' }}>
                  3. Commercial Paper Trail &amp; Invoice Reference
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label>
                    Store invoice / Receipt number
                    <input
                      required
                      placeholder="e.g. INV-2026-1049"
                      value={invoiceRef}
                      onChange={(e) => setInvoiceRef(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </label>
                  <label>
                    Handover date
                    <input
                      required
                      type="date"
                      value={handoverDate}
                      onChange={(e) => setHandoverDate(e.target.value)}
                    />
                  </label>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label>
                    Warranty / Service plan notes (optional)
                    <textarea
                      rows={2}
                      placeholder="e.g. Includes manufacturer frame warranty & 6-month store checkup."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {error && (
                <p className="auth-error" role="alert" style={{ margin: '4px 0 0 0' }}>
                  {error}
                </p>
              )}

              <button
                className="button button-green full-button"
                type="submit"
                disabled={busy}
                style={{ marginTop: '10px', height: '48px', justifyContent: 'center', fontSize: '15px' }}
              >
                {busy ? 'Creating transfer & certificate…' : 'Complete Transfer & Generate Paper Trail'} <FiFileText />
              </button>
            </form>
          </div>
        )}
      </div>
    </DemoShell>
  )
}

export default function StoreTransferPage() {
  return (
    <Suspense fallback={<div className="empty-state">Loading transfer workspace…</div>}>
      <StoreTransferContent />
    </Suspense>
  )
}
