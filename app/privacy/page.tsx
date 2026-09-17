import Link from 'next/link'
import { DemoShell } from '../components/DemoShell'

export default function PrivacyPage() {
  return <DemoShell><article className="legal-page"><p className="eyebrow dark-eyebrow">CycleTrace policy</p><h1>Privacy<br /><span>policy.</span></h1><p className="legal-lede">This policy explains how CycleTrace handles bicycle ownership and contact information.</p><h2>Information we collect</h2><p>We collect the details needed to identify a bicycle, support ownership transfers, manage accounts and respond to theft reports.</p><h2>POPIA principles</h2><p>CycleTrace follows lawful and transparent processing, purpose limitation, data minimisation, accuracy, retention controls, security safeguards and data-subject access.</p><h2>How we use it</h2><p>Records help riders verify bikes, insurers confirm ownership and the community identify reported stolen bicycles. We do not sell personal information.</p><h2>Your choices</h2><p>You can request access, correction or deletion where applicable. Contact <a href="mailto:privacy@cycletrace.co.za">privacy@cycletrace.co.za</a>.</p><Link className="back-link" href="/">← Back to CycleTrace</Link></article></DemoShell>
}
