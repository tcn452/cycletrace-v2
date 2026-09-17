import Link from 'next/link'
import { FiArrowRight, FiShield } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'

export default function InsurerOnboardingPage() {
  return <DemoShell active="Overview" showSidebar><div className="role-form-layout"><div className="role-form-intro"><p className="eyebrow dark-eyebrow">Insurer onboarding</p><h1>Bring better<br /><span>context to cover.</span></h1><p>Insurer organizations are provisioned by CycleTrace so memberships and row permissions can be verified before access is granted.</p><div className="role-trust-note"><FiShield /><span><strong>Responsible access</strong><small>Organization records remain private and role-controlled in Appwrite.</small></span></div></div><div className="form-card role-form-card"><h2>Request insurer access</h2><p>Contact our partnerships team with your organization name, work email, and intended role. We will create the live Appwrite organization and membership records after verification.</p><Link className="button button-green" href="mailto:partnerships@cycletrace.co.za?subject=CycleTrace%20insurer%20access">Contact partnerships <FiArrowRight /></Link></div></div></DemoShell>
}
