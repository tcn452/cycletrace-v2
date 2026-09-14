import Link from 'next/link'
import { DemoShell } from '../components/DemoShell'

export default function TermsPage() {
  return <DemoShell><article className="legal-page"><p className="eyebrow dark-eyebrow">CycleTrace policy</p><h1>Terms &amp;<br /><span>conditions.</span></h1><p className="legal-lede">These client-preview terms describe the intended use of CycleTrace. Final legal terms will be reviewed before production launch.</p><h2>Using the registry</h2><p>Use CycleTrace to register bicycles you own, make responsible verification checks and provide accurate information when reporting a theft or transferring ownership.</p><h2>Public records</h2><p>Some bicycle details may be visible in public search results so buyers, shops and recovery partners can verify a record. Private account and payment details are not public.</p><h2>Support</h2><p>For questions about these terms, contact <a href="mailto:hello@cycletrace.co.za">hello@cycletrace.co.za</a>.</p><Link className="back-link" href="/">← Back to CycleTrace</Link></article></DemoShell>
}
