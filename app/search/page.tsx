'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { DemoShell } from '../components/DemoShell'
import { searchResults } from '../lib/demo-data'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(true)
  function submit(event: FormEvent) { event.preventDefault(); setSearched(true) }
  return <DemoShell active="Search registry"><div className="page-heading compact-heading"><div><p className="eyebrow dark-eyebrow">Public registry</p><h1>Search the <span>trace.</span></h1><p>Check a serial number before you buy, sell or insure a bike.</p></div><span className="secure-note">◎ Trusted records<br /><strong>4,826 bikes listed</strong></span></div>
    <form className="registry-search-form" onSubmit={submit}><div className="large-search-input"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search serial number, brand or model" /><button className="button button-green" type="submit">Search registry <span>→</span></button></div><div className="search-filters"><span>Popular searches</span><button type="button" onClick={() => setQuery('Specialized')}>Specialized</button><button type="button" onClick={() => setQuery('Trek')}>Trek</button><button type="button" onClick={() => setQuery('Cape Town')}>Cape Town</button><span className="filter-spacer" /><button type="button">Filters +</button></div></form>
    <div className="results-header"><div><strong>{searched ? '2 bikes found' : 'Search the registry'}</strong><span> showing public records</span></div><select aria-label="Sort results"><option>Most relevant</option><option>Recently added</option></select></div><div className="result-list">{searchResults.map(bike => <Link className="result-card" href={`/bikes/${bike.id}`} key={bike.id}><div className="result-thumb" style={{ backgroundImage: `url(${bike.image})` }} /><div className="result-details"><div className="result-card-top"><span className={bike.status === 'Reported stolen' ? 'status status-stolen' : 'status'}>{bike.status === 'Reported stolen' ? '● Reported stolen' : '✓ Protected'}</span><span className="result-date">Added 12 Aug 2024</span></div><h2>{bike.brand} {bike.model}</h2><p>{bike.year} · {bike.colour} · {bike.location}</p><span className="serial">Serial <strong>{bike.serial}</strong></span></div><span className="result-arrow">→</span></Link>)}</div><div className="registry-notice"><span>✦</span><p><strong>Buying second-hand?</strong> A clean search is a good start, but always ask the seller for proof of ownership too.</p><Link href="/#how-it-works">Learn about safe buying →</Link></div>
  </DemoShell>
}
