import Link from 'next/link'
import type { ReactNode } from 'react'
import { FiArrowUpRight, FiBell, FiBookOpen, FiGrid, FiHelpCircle, FiHome, FiPlus, FiSearch, FiShield } from 'react-icons/fi'
import { BrandMark } from './BrandMark'

export function DemoShell({ children, active = 'Overview', showSidebar = false }: { children: React.ReactNode; active?: string; showSidebar?: boolean }) {
  const links: { label: string; href: string; icon: ReactNode }[] = [{ label: 'Overview', href: '/dashboard', icon: <FiHome /> }, { label: 'My bikes', href: '/dashboard#bikes', icon: <FiGrid /> }, { label: 'Search registry', href: '/search', icon: <FiSearch /> }, { label: 'Recovery stories', href: '/#stories', icon: <FiBookOpen /> }]
  return <div className={`app-frame${showSidebar ? '' : ' public-frame'}`}>
    {showSidebar && <aside className="app-sidebar">
      <Link className="brand app-brand" href="/"><BrandMark variant="dark" /></Link>
      <div className="demo-badge">CLIENT DEMO <span>v0.1</span></div>
      <nav className="app-nav">{links.map(({ label, href, icon }) => <Link className={active === label ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="sidebar-help"><span className="help-icon"><FiHelpCircle /></span><strong>Need a hand?</strong><p>Our team is here to help with your bike record.</p><a href="mailto:hello@cycletrace.co.za">Contact support <FiArrowUpRight /></a></div>
      <div className="sidebar-user"><span className="user-avatar">KM</span><span><strong>Kayla Morgan</strong><small>Personal account</small></span><span className="more-dot"><FiShield /></span></div>
    </aside>}
    <div className="app-content"><header className="app-topbar"><div><Link className="public-top-brand" href="/"><BrandMark variant="dark" /></Link><span className="mobile-app-brand"><BrandMark /></span><span className="breadcrumb">Workspace / {active}</span></div><div className="topbar-actions">{showSidebar ? <><Link href="/search" className="topbar-search"><FiSearch /> <span>Search registry</span></Link><span className="notification"><FiBell /><i /></span><Link className="button button-dark button-small" href="/register">Add a bike <FiPlus /></Link></> : <nav className="public-top-nav"><Link href="/search">Search a bike</Link><Link href="/organizations">For organisations</Link><Link href="/login">Log in</Link><Link className="button button-dark button-small" href="/register">Register a bike <FiArrowUpRight /></Link></nav>}</div></header><main className="app-main">{children}</main></div>
  </div>
}
