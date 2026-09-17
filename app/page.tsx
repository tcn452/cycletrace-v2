'use client'

import { FormEvent, useState } from 'react'
import { FiArrowRight, FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi'
import { BrandMark } from './components/BrandMark'
import { PublicAboutSections } from './components/PublicAboutSections'

const steps = [
  ['01', 'Register your bike', 'Add the details that make your bike yours. It takes less than five minutes.'],
  ['02', 'Report if it’s stolen', 'Flag it quickly so the people looking can spot it sooner.'],
  ['03', 'Bring it back home', 'Get notified when someone finds a match and help prove ownership.'],
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) window.location.assign(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <a className="skip-link" href="#top">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CycleTrace home"><BrandMark variant="dark" /></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? <FiX /> : <FiMenu />}</span><b>{menuOpen ? 'Close' : 'Menu'}</b></button>
        <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <a href="/search" onClick={() => setMenuOpen(false)}>Search a bike</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="/organizations" onClick={() => setMenuOpen(false)}>For organisations</a><a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a><a className="mobile-menu-action" href="/login" onClick={() => setMenuOpen(false)}>Log in</a><a className="mobile-menu-action mobile-menu-register" href="/register" onClick={() => setMenuOpen(false)}>Register a bike <FiArrowUpRight /></a>
        </nav>
        <div className="header-actions"><a className="login-link" href="/login">Log in</a><a className="button button-dark button-small" href="/register">Register a bike <FiArrowUpRight /></a></div>
      </header>

      <main id="top">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'CycleTrace',
          url: 'https://cycletrace.co.za',
          logo: 'https://cycletrace.co.za/logo.svg',
          description: "South Africa's bike registry for registering, searching and recovering bicycles.",
          areaServed: 'ZA',
        }) }} />
        <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> South Africa&apos;s bike registry</p><h1>The bike registry<br />that <em>works.</em></h1><p className="hero-lede">Put your bike on the map. Register it once, search before you buy, and give the community a better chance of bringing stolen bikes home.</p><div className="hero-actions"><a className="button button-green" href="/register">Register your bike <FiArrowUpRight /></a><a className="text-link light-link" href="#search">Search the registry <FiArrowRight /></a></div><div className="hero-proof"><span>Live records are stored securely in Appwrite.</span></div></div><div className="hero-visual" aria-label="Bike registration card preview"><div className="visual-top"><span className="live-label"><i /> Live registry</span></div><div className="bike-photo"><div className="photo-tag">Owner record</div></div><div className="bike-card-info"><div><span className="micro-label">REGISTERED BIKE</span><h2>Your bike.<br />Your record.</h2></div><span className="verified-badge">✓</span></div><div className="bike-card-meta"><span>Serial number</span><strong>Stored securely</strong><span className="card-status">Protected</span></div><div className="scan-line" /><span className="corner-mark top-left" /><span className="corner-mark bottom-right" /></div></section>

        <section className="stats-strip" aria-label="CycleTrace capabilities"><div><strong>Live</strong><span>Appwrite registry</span></div><div><strong>Fast</strong><span>serial searches</span></div><div><strong>Clear</strong><span>ownership records</span></div><div><strong>Safe</strong><span>transfer workflow</span></div></section>

        <section className="search-section section-shell" id="search"><div className="section-heading"><div><p className="eyebrow dark-eyebrow">Make every purchase count</p><h2>Before you buy,<br /><span>check the trace.</span></h2></div><p>Buying second-hand? Search our live registry using a bike&apos;s serial number and make a confident choice.</p></div><form className="search-box" onSubmit={search}><label htmlFor="serial-search">Search by serial number, brand or model</label><div className="search-row"><input id="serial-search" required type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Enter a serial number, brand or model" /><button className="button button-green" type="submit">Search registry <FiArrowRight /></button></div></form></section>
        <PublicAboutSections />

        <section className="registry-section section-shell" id="how-it-works"><div className="registry-image"><div className="image-note"><span>01</span><p>Every bike<br />has a story.</p></div></div><div className="registry-copy"><p className="eyebrow dark-eyebrow">More than a database</p><h2>A little detail<br />goes a <span>long way.</span></h2><p>CycleTrace connects riders, shops, insurers and communities through one trusted record of ownership. Your serial number is the starting point.</p><div className="feature-list">{steps.map(([number, title, description]) => <div key={number}><span className="feature-icon">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div><a className="text-link dark-link" href="/register">See how CycleTrace works <FiArrowRight /></a></div></section>

        <section className="community-section" id="stories"><div className="section-shell community-inner"><div className="section-heading community-heading"><div><p className="eyebrow dark-eyebrow">Built for safer exchanges</p><h2>Check first.<br /><span>Trade with confidence.</span></h2></div></div><div className="story-grid"><article className="story-card story-feature"><div className="story-image" /><div className="story-content"><span className="story-label">Public registry</span><h3>Search the live record before buying a second-hand bike.</h3></div></article><article className="story-card quote-card"><p>Every accurate registration and search makes the ownership trail clearer for riders, shops, and insurers.</p></article></div></div></section>

        <section className="register-cta" id="register"><div><p className="eyebrow">Your bike. Your record.</p><h2>Make it easier<br />to come <em>home.</em></h2></div><div className="cta-side"><p>Register your bike today for <strong>R24.99 / month</strong>. You&apos;ll get a permanent ownership record and a community looking out for you.</p><a className="button button-green" href="/register">Start your registration <FiArrowUpRight /></a></div></section>
        <section className="partners-section section-shell" id="partners"><p className="eyebrow dark-eyebrow">Built for everyone who cares about bikes</p><div className="partner-row"><span>BIKE SHOPS</span><span>INSURERS</span><span>COMMUNITIES</span><span>LAW ENFORCEMENT</span><span>RIDERS</span></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><a className="brand footer-brand" href="#top"><BrandMark /></a><p>One trusted record.<br />A safer ride for everyone.</p><a className="button button-green" href="/register">Register a bike <FiArrowUpRight /></a></div><div className="footer-bottom"><span>© 2026 CycleTrace · Made for South African riders</span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="mailto:hello@cycletrace.co.za">Contact</a></div></div></footer>
    </>
  )
}
