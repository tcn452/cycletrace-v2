'use client'

import { FormEvent, useState } from 'react'

const steps = [
  ['01', 'Register your bike', 'Add the details that make your bike yours. It takes less than five minutes.'],
  ['02', 'Report if it’s stolen', 'Flag it quickly so the people looking can spot it sooner.'],
  ['03', 'Bring it back home', 'Get notified when someone finds a match and help prove ownership.'],
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(query.trim() ? `Searching the registry for “${query.trim()}”… No matches found. This bike may be ready to register.` : 'Enter a serial number, brand or model to search the registry.')
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CycleTrace home"><BrandMark /><span>CYCLE<span>TRACE</span></span></a>
        <button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
        <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <a href="/search" onClick={() => setMenuOpen(false)}>Search a bike</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="/organizations" onClick={() => setMenuOpen(false)}>For organisations</a><a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a>
        </nav>
        <div className="header-actions"><a className="login-link" href="/login">Log in</a><a className="button button-dark button-small" href="/register">Register a bike <span>↗</span></a></div>
      </header>

      <main id="top">
        <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> South Africa&apos;s bike registry</p><h1>The bike registry<br />that <em>works.</em></h1><p className="hero-lede">Put your bike on the map. Register it once, search before you buy, and give the community a better chance of bringing stolen bikes home.</p><div className="hero-actions"><a className="button button-green" href="#register">Register your bike <span>↗</span></a><a className="text-link light-link" href="#search">Search the registry <span>→</span></a></div><div className="hero-proof"><div className="avatar-stack"><i /><i /><i /><i>+</i></div><span>Join <strong>4,800+</strong> riders protecting their bikes</span></div></div><div className="hero-visual" aria-label="Bike registration card preview"><div className="visual-top"><span className="live-label"><i /> Live registry</span><span>09 / 24</span></div><div className="bike-photo"><div className="photo-tag">Verified owner</div></div><div className="bike-card-info"><div><span className="micro-label">REGISTERED BIKE</span><h2>Specialized<br />Allez Sport</h2></div><span className="verified-badge">✓</span></div><div className="bike-card-meta"><span>Serial number</span><strong>WSBC6019····</strong><span className="card-status">Active</span></div><div className="scan-line" /><span className="corner-mark top-left" /><span className="corner-mark bottom-right" /></div></section>

        <section className="stats-strip" aria-label="CycleTrace statistics"><div><strong>4,826</strong><span>bikes protected</span></div><div><strong>156</strong><span>reported stolen</span></div><div><strong>38</strong><span>reunited with owners</span></div><div><strong>9</strong><span>trusted partners</span></div></section>

        <section className="search-section section-shell" id="search"><div className="section-heading"><div><p className="eyebrow dark-eyebrow">Make every purchase count</p><h2>Before you buy,<br /><span>check the trace.</span></h2></div><p>Buying second-hand? Search our registry using a bike&apos;s serial number and make a confident choice.</p></div><form className="search-box" onSubmit={search}><label htmlFor="serial-search">Search by serial number, brand or model</label><div className="search-row"><input id="serial-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. WSBC6019 or Trek Marlin" /><button className="button button-green" type="submit">Search registry <span>→</span></button></div><p className="search-result" aria-live="polite">{result}</p></form></section>

        <section className="registry-section section-shell" id="how-it-works"><div className="registry-image"><div className="image-note"><span>01</span><p>Every bike<br />has a story.</p></div></div><div className="registry-copy"><p className="eyebrow dark-eyebrow">More than a database</p><h2>A little detail<br />goes a <span>long way.</span></h2><p>CycleTrace connects riders, shops, insurers and communities through one trusted record of ownership. Your serial number is the starting point.</p><div className="feature-list">{steps.map(([number, title, description]) => <div key={number}><span className="feature-icon">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div><a className="text-link dark-link" href="#register">See how CycleTrace works <span>→</span></a></div></section>

        <section className="community-section" id="stories"><div className="section-shell community-inner"><div className="section-heading community-heading"><div><p className="eyebrow dark-eyebrow">The community is watching</p><h2>Good news travels<br /><span>fast.</span></h2></div><a className="text-link dark-link" href="#stories">Read all recovery stories <span>→</span></a></div><div className="story-grid"><article className="story-card story-feature"><div className="story-image" /><div className="story-content"><span className="story-label">Bike recovered · Cape Town</span><h3>“Someone checked the number before they bought it. That small step brought my bike home.”</h3><p>— Kayla M., CycleTrace rider</p></div></article><article className="story-card quote-card"><span className="quote-mark">“</span><p>A registry is only as powerful as the people who use it. Every search makes cycling a little safer for all of us.</p><div className="quote-author"><span className="author-avatar">LM</span><span><strong>Luke M.</strong><small>CycleTrace community</small></span></div></article></div></div></section>

        <section className="register-cta" id="register"><div><p className="eyebrow">Your bike. Your record.</p><h2>Make it easier<br />to come <em>home.</em></h2></div><div className="cta-side"><p>Register your bike today for <strong>R24.99 / month</strong>. You&apos;ll get a permanent ownership record and a community looking out for you.</p><a className="button button-green" href="#register">Start your registration <span>↗</span></a></div></section>
        <section className="partners-section section-shell" id="partners"><p className="eyebrow dark-eyebrow">Built for everyone who cares about bikes</p><div className="partner-row"><span>BIKE SHOPS</span><span>INSURERS</span><span>COMMUNITIES</span><span>LAW ENFORCEMENT</span><span>RIDERS</span></div></section>
      </main>

      <footer className="site-footer"><div className="footer-top"><a className="brand footer-brand" href="#top"><BrandMark /><span>CYCLE<span>TRACE</span></span></a><p>One trusted record.<br />A safer ride for everyone.</p><a className="button button-green" href="#register">Register a bike <span>↗</span></a></div><div className="footer-bottom"><span>© 2026 CycleTrace · Made for South African riders</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="mailto:hello@cycletrace.co.za">Contact</a></div></div></footer>
    </>
  )
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><i /><b /></span>
}
