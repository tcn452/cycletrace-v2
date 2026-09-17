import Link from 'next/link'
import { FiArrowLeft, FiInfo } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'

export default function BillingPage() {
  return <DemoShell active="Settings" showSidebar><Link className="back-link" href="/settings"><FiArrowLeft /> Back to settings</Link><div className="billing-heading"><div><p className="eyebrow dark-eyebrow">Subscription &amp; payments</p><h1>Billing is<br /><span>not enabled yet.</span></h1><p>No payment method, invoices, subscription, or renewal date will be displayed until a real billing record is connected.</p></div></div><div className="empty-state"><FiInfo /><h3>No live billing data</h3><p>Your Appwrite bike records remain available. Billing will appear here after the production payment integration is configured.</p></div></DemoShell>
}
