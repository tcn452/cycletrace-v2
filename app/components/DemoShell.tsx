import Link from 'next/link'
import { BrandMark } from './BrandMark'

export function DemoShell({ children, active = 'Overview' }: { children: React.ReactNode; active?: string }) {
  const links = [['Overview', '/dashboard', '⌂'], ['My bikes', '/dashboard#bikes', '▣'], ['Search registry', '/search', '⌕'], ['Recovery stories', '/#stories', '↗']]
  return <div className="app-frame">
    <aside className="app-sidebar">
      <Link className="brand app-brand" href="/"><BrandMark /><span>CYCLE<span>TRACE</span></span></Link>
      <div className="demo-badge">CLIENT DEMO <span>v0.1</span></div>
      <nav className="app-nav">{links.map(([label, href, icon]) => <Link className={active === label ? 'active' : ''} href={href} key={label}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="sidebar-help"><span className="help-icon">?</span><strong>Need a hand?</strong><p>Our team is here to help with your bike record.</p><a href="mailto:hello@cycletrace.co.za">Contact support →</a></div>
      <div className="sidebar-user"><span className="user-avatar">KM</span><span><strong>Kayla Morgan</strong><small>Personal account</small></span><span className="more-dot">···</span></div>
    </aside>
    <div className="app-content"><header className="app-topbar"><div><span className="mobile-app-brand"><BrandMark /> CYCLE<span>TRACE</span></span><span className="breadcrumb">Workspace / {active}</span></div><div className="topbar-actions"><Link href="/search" className="topbar-search">⌕ <span>Search registry</span></Link><span className="notification">♢<i /></span><Link className="button button-dark button-small" href="/register">Add a bike <span>+</span></Link></div></header><main className="app-main">{children}</main></div>
  </div>
}
