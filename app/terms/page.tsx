import Link from 'next/link'
import { DemoShell } from '../components/DemoShell'

export default function TermsPage() {
  return <DemoShell><article className="legal-page"><p className="eyebrow dark-eyebrow">CycleTrace policy</p><h1>Terms &amp;<br /><span>conditions.</span></h1><p className="legal-lede">These terms describe the responsible use of CycleTrace.</p><h2>Using the registry</h2><p>Register only bicycles you own, make responsible verification checks, and provide accurate information when reporting theft or transferring ownership.</p><h2>Public records</h2><p>Some bicycle details are visible in public search results so buyers, shops and recovery partners can verify a record. Private account details are not public.</p><h2>Support</h2><p>For questions, contact <a href="mailto:hello@cycletrace.co.za">hello@cycletrace.co.za</a>.</p><Link className="back-link" href="/">← Back to CycleTrace</Link></article></DemoShell>
}
