'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiBell, FiBookOpen, FiGrid, FiHelpCircle, FiHome, FiMenu, FiPlus, FiSearch, FiSettings, FiShield, FiX } from 'react-icons/fi'
import { BrandMark } from './BrandMark'

export function DemoShell({ children, active = 'Overview', showSidebar = false }: { children: React.ReactNode; active?: string; showSidebar?: boolean }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const links: { label: string; href: string; icon: ReactNode }[] = [{ label: 'Overview', href: '/dashboard', icon: <FiHome /> }, { label: 'My bikes', href: '/dashboard#bikes', icon: <FiGrid /> }, { label: 'Search registry', href: '/search', icon: <FiSearch /> }, { label: 'Recovery stories', href: '/#stories', icon: <FiBookOpen /> }, { label: 'Settings', href: '/settings', icon: <FiSettings /> }]
  return <div className={`app-frame${showSidebar ? '' : ' public-frame'}`}>
    {showSidebar && <aside className={`app-sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
      <Link className="brand app-brand" href="/" onClick={() => setMobileNavOpen(false)}><BrandMark variant="dark" /></Link>
      <div className="demo-badge">CLIENT DEMO <span>v0.1</span></div>
      <nav className="app-nav">{links.map(({ label, href, icon }) => <Link className={active === label ? 'active' : ''} href={href} key={label} onClick={() => setMobileNavOpen(false)}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="sidebar-help"><span className="help-icon"><FiHelpCircle /></span><strong>Need a hand?</strong><p>Our team is here to help with your bike record.</p><a href="mailto:hello@cycletrace.co.za">Contact support <FiArrowUpRight /></a></div>
      <div className="sidebar-user"><span className="user-avatar">KM</span><span><strong>Kayla Morgan</strong><small>Personal account</small></span><span className="more-dot"><FiShield /></span></div>
    </aside>}
    <div className="app-content"><header className="app-topbar"><div className="topbar-identity">{showSidebar && <><button className="workspace-back-button" type="button" onClick={() => window.history.back()} aria-label="Go back"><FiArrowLeft /></button><button className="workspace-menu-toggle" type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? 'Close workspace navigation' : 'Open workspace navigation'}>{mobileNavOpen ? <FiX /> : <FiMenu />}</button></>}<Link className="public-top-brand" href="/"><BrandMark variant="dark" /></Link><span className="mobile-app-brand"><BrandMark /></span><span className="breadcrumb">Workspace / {active}</span></div><div className="topbar-actions">{showSidebar ? <><Link href="/search" className="topbar-search"><FiSearch /> <span>Search registry</span></Link><div className="notification-wrap"><button className="notification" type="button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Open notifications" aria-expanded={notificationsOpen}><FiBell /><i /></button>{notificationsOpen && <div className="notification-menu"><div className="notification-menu-heading"><strong>Notifications</strong><button type="button" onClick={() => setNotificationsOpen(false)}><FiX /></button></div><div className="notification-item"><span className="notification-dot" /><div><strong>Your record was viewed</strong><p>Specialized Allez Sport · 2h ago</p></div></div><div className="notification-item"><span className="notification-dot yellow" /><div><strong>Protection is active</strong><p>Your next renewal is 24 Oct 2026</p></div></div><Link href="/settings" onClick={() => setNotificationsOpen(false)}>Notification settings <FiArrowRight /></Link></div>}</div><Link className="button button-dark button-small" href="/register">Add a bike <FiPlus /></Link></> : <nav className="public-top-nav"><Link href="/search">Search a bike</Link><Link href="/organizations">For organisations</Link><Link href="/login">Log in</Link><Link className="button button-dark button-small" href="/register">Register a bike <FiArrowUpRight /></Link></nav>}</div></header><main className="app-main">{children}</main></div>
    {showSidebar && mobileNavOpen && <button className="workspace-backdrop" aria-label="Close workspace navigation" onClick={() => setMobileNavOpen(false)} />}
  </div>
}
