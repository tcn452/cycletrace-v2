'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCheck, FiCreditCard, FiDownload, FiInfo, FiX } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'

export default function BillingPage() {
  const [cancelled, setCancelled] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')

  async function startCheckout() {
    setCheckoutMessage('Preparing PayFast sandbox checkout...')
    const response = await fetch('/api/payfast/checkout', { method: 'POST' })
    const result = await response.json() as { demo?: boolean; message?: string; action?: string; fields?: Record<string, string> }
    if (result.demo) {
      setCheckoutMessage(result.message || 'Add sandbox credentials to test checkout.')
      return
    }
    if (!result.action || !result.fields) {
      setCheckoutMessage('PayFast checkout could not be prepared.')
      return
    }
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = result.action
    Object.entries(result.fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
  }
  return <DemoShell active="Settings" showSidebar><Link className="back-link" href="/settings"><FiArrowLeft /> Back to settings</Link><div className="billing-heading"><div><p className="eyebrow dark-eyebrow">Subscription &amp; payments</p><h1>Keep your<br /><span>protection active.</span></h1><p>Manage the CycleTrace plan that keeps your ownership records visible and protected.</p></div><span className="sandbox-pill"><FiInfo /> Demo billing · Sandbox mode</span></div><div className="billing-layout"><div className="billing-main"><section className="plan-card"><div className="plan-card-top"><div><span className="status"><FiCheck /> {cancelled ? 'Ends 24 Oct 2026' : 'Active plan'}</span><h2>CycleTrace Protected</h2><p>One bike record, one community looking out for you.</p></div><div className="plan-price"><strong>R24.99</strong><span>/ month</span></div></div><div className="plan-features"><span><FiCheck /> Permanent ownership record</span><span><FiCheck /> Stolen bike reporting</span><span><FiCheck /> Community recovery alerts</span></div><div className="plan-card-footer"><span>{cancelled ? 'Your plan will stay active until 24 October 2026.' : 'Next payment · 24 October 2026'}</span>{cancelled ? <button className="text-button" onClick={() => setCancelled(false)}>Keep my plan</button> : <button className="text-button danger-link" onClick={() => setShowCancel(true)}>Cancel plan</button>}</div></section><section className="billing-card"><div className="billing-card-heading"><div><p className="eyebrow dark-eyebrow">Payment method</p><h2>How you pay</h2></div><button className="text-button" type="button">Update card</button></div><div className="payment-method"><span className="card-brand">VISA</span><div><strong>•••• •••• •••• 4081</strong><small>Expires 12 / 28 · Kayla Morgan</small></div><span className="status"><FiCheck /> Default</span></div></section><section className="billing-card"><div className="billing-card-heading"><div><p className="eyebrow dark-eyebrow">Payment history</p><h2>Invoices</h2></div><button className="text-button" type="button">Download all <FiDownload /></button></div><div className="invoice-list"><div className="invoice-row invoice-head"><span>DATE</span><span>DESCRIPTION</span><span>AMOUNT</span><span>STATUS</span><span /></div>{[['24 Sep 2026', 'CycleTrace Protected', 'R24.99'], ['24 Aug 2026', 'CycleTrace Protected', 'R24.99'], ['24 Jul 2026', 'CycleTrace Protected', 'R24.99']].map(([date, description, amount]) => <div className="invoice-row" key={date}><span>{date}</span><strong>{description}</strong><span>{amount}</span><span className="status"><FiCheck /> Paid</span><button className="icon-button" aria-label={`Download invoice for ${date}`}><FiDownload /></button></div>)}</div></section></div><aside className="billing-aside"><div className="billing-summary"><span className="summary-icon"><FiCreditCard /></span><p className="eyebrow dark-eyebrow">This month</p><strong>R24.99</strong><span>Charged monthly in ZAR</span><div><small>Current plan</small><b>Protected</b></div><div><small>Registered bikes</small><b>2 bikes</b></div></div><div className="payfast-note"><strong>Secure payments</strong><p>When connected, CycleTrace will use PayFast recurring billing for South African card payments.</p><a href="https://sandbox.payfast.co.za" target="_blank" rel="noreferrer">Open PayFast Sandbox <FiArrowRight /></a><button className="button button-dark payfast-checkout-button" onClick={startCheckout}>Test PayFast checkout <FiArrowRight /></button>{checkoutMessage && <p className="checkout-message">{checkoutMessage}</p>}</div></aside></div>{showCancel && <div className="modal-backdrop" role="presentation"><div className="confirm-modal"><button className="modal-close" onClick={() => setShowCancel(false)} aria-label="Close"><FiX /></button><span className="modal-icon"><FiInfo /></span><h2>Cancel your protection?</h2><p>You&apos;ll keep access until the end of your billing period. Your bike records will remain saved, but active protection features will pause.</p><div className="modal-actions"><button className="text-button" onClick={() => setShowCancel(false)}>Keep my plan</button><button className="button button-dark" onClick={() => { setCancelled(true); setShowCancel(false) }}>Cancel plan <FiArrowRight /></button></div></div></div>}</DemoShell>
}
