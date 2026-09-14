import Link from 'next/link'
import { DemoShell } from '../components/DemoShell'

export default function PrivacyPage() {
  return <DemoShell><article className="legal-page"><p className="eyebrow dark-eyebrow">CycleTrace policy</p><h1>Privacy<br /><span>policy.</span></h1><p className="legal-lede">This client-preview policy explains how CycleTrace plans to handle bicycle ownership and contact information. The production version will be reviewed and updated before launch.</p><h2>Information we collect</h2><p>We collect the details needed to identify a bicycle, support ownership transfers, process subscriptions and respond to theft reports. We aim to collect only what is needed for those purposes.</p><h2>How we use it</h2><p>Records help riders verify bikes, insurers confirm ownership and the community identify reported stolen bicycles. We do not sell personal information.</p><h2>Questions</h2><p>Contact <a href="mailto:hello@cycletrace.co.za">hello@cycletrace.co.za</a> if you have a question about your information.</p><Link className="back-link" href="/">← Back to CycleTrace</Link></article></DemoShell>
}
