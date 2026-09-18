'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiPrinter,
  FiShield,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi'
import { DemoShell } from '../../../../components/DemoShell'
import { getTransferById, OwnershipTransfer } from '../../../../lib/appwrite/transfers'
import { getStoreWorkspace } from '../../../../lib/appwrite/store'

export default function TransferCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [transfer, setTransfer] = useState<OwnershipTransfer | null>(null)
  const [storeName, setStoreName] = useState('CycleTrace Verified Retailer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTransferById(id), getStoreWorkspace().catch(() => null)])
      .then(([tr, ws]) => {
        if (tr) setTransfer(tr)
        if (ws?.store?.businessName) setStoreName(ws.store.businessName)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div className="empty-state">Loading certificate of transfer…</div>
      </DemoShell>
    )
  }

  if (!transfer) {
    return (
      <DemoShell active="Overview" showSidebar>
        <div className="empty-state" style={{ maxWidth: '480px', margin: '40px auto' }}>
          <h3>Transfer record not found</h3>
          <p>The requested ownership transfer certificate could not be located.</p>
          <Link className="button button-green" href="/store-owner">
            Return to store workspace
          </Link>
        </div>
      </DemoShell>
    )
  }

  const certificateNo =
    transfer.certificateNumber ||
    `CERT-CT-${transfer.$id.slice(-6).toUpperCase()}`

  return (
    <DemoShell active="Overview" showSidebar>
      <div style={{ maxWidth: '800px', margin: '20px auto 60px' }}>
        {/* Top Control Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Link
            href="/store-owner"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6e7772',
            }}
          >
            <FiArrowLeft /> Back to store workspace
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="button button-dark button-small"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPrinter /> Print Certificate / Paper Trail
          </button>
        </div>

        {/* Certificate Container */}
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #173426',
            borderRadius: '16px',
            padding: '44px 40px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
            position: 'relative',
          }}
        >
          {/* Header watermark stamp */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #edf0ee',
              paddingBottom: '24px',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px', color: '#173426' }}>
                  <FiShield />
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#173426' }}>
                  CycleTrace
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: '#eefbf3',
                    color: '#167240',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Verified Transfer
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e7772' }}>
                National Bicycle Registry of South Africa · Ownership Handover Record
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#6e7772', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Certificate Number
              </span>
              <strong style={{ fontFamily: 'monospace', fontSize: '15px', color: '#173426' }}>
                {certificateNo}
              </strong>
            </div>
          </div>

          {/* Certificate Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#173426' }}>
              Certificate of Ownership Transfer
            </h1>
            <p style={{ fontSize: '14px', color: '#5f6964', maxWidth: '560px', margin: '0 auto' }}>
              This document serves as an immutable digital paper trail confirming that ownership of the bicycle specified below was officially transferred by the registered retailer.
            </p>
          </div>

          {/* Transfer Parties Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              background: '#f8faf9',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '28px',
              border: '1px solid #e1e7e4',
            }}
          >
            {/* Origin Store */}
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e7772', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <FiShoppingBag /> Originating Store (Seller)
              </span>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#173426' }}>
                {transfer.fromStoreName || storeName}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e7772' }}>
                Status: Verified CycleTrace Retail Partner
              </p>
              {transfer.invoiceRef && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#173426' }}>
                  Invoice / Receipt: <strong style={{ fontFamily: 'monospace' }}>{transfer.invoiceRef}</strong>
                </p>
              )}
            </div>

            {/* Recipient Biker */}
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6e7772', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <FiUser /> Transferred To (Buyer / Biker)
              </span>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#173426' }}>
                {transfer.toName}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e7772' }}>
                Email: {transfer.toEmail}
              </p>
              {transfer.toPhone && (
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6e7772' }}>
                  Phone: {transfer.toPhone}
                </p>
              )}
            </div>
          </div>

          {/* Bicycle Details Table */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#173426', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> Bicycle Identification Details
            </h2>
            <div
              style={{
                border: '1px solid #dce2df',
                borderRadius: '10px',
                overflow: 'hidden',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #edf0ee', padding: '12px 16px', background: '#fafbfa' }}>
                <span style={{ color: '#6e7772' }}>Make &amp; Model</span>
                <strong style={{ color: '#173426' }}>
                  {transfer.bikeSummary?.brand || 'Registered'} {transfer.bikeSummary?.model || 'Bicycle'}
                </strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #edf0ee', padding: '12px 16px' }}>
                <span style={{ color: '#6e7772' }}>Frame Serial Number</span>
                <strong style={{ fontFamily: 'monospace', letterSpacing: '0.05em', color: '#173426' }}>
                  {transfer.bikeSummary?.serialNumber || 'Recorded in Registry'}
                </strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #edf0ee', padding: '12px 16px', background: '#fafbfa' }}>
                <span style={{ color: '#6e7772' }}>Year &amp; Colour</span>
                <span>{transfer.bikeSummary?.year || 'N/A'} · {transfer.bikeSummary?.colour || 'Standard'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 16px' }}>
                <span style={{ color: '#6e7772' }}>Handover Timestamp</span>
                <span>{new Date(transfer.createdAt).toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          {transfer.notes && (
            <div style={{ marginBottom: '28px', padding: '14px 18px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #e1e7e4' }}>
              <span style={{ fontSize: '11px', color: '#6e7772', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                Store Notes &amp; Service Plan
              </span>
              <p style={{ margin: 0, fontSize: '13px', color: '#173426' }}>{transfer.notes}</p>
            </div>
          )}

          {/* Verification Seal & Signature Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '2px solid #edf0ee',
              paddingTop: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#167240', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                <FiCheckCircle /> Verifiable Registry Token:
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6e7772' }}>
                {transfer.transferToken}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #173426', width: '180px', marginBottom: '6px' }} />
              <span style={{ fontSize: '11px', color: '#6e7772', display: 'block' }}>
                Authorized Retailer Handover
              </span>
              <strong style={{ fontSize: '12px', color: '#173426' }}>CycleTrace Certified</strong>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  )
}
