'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiSearch, FiShield } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { BikeRecord, searchAppwriteBikes } from '../lib/appwrite/bikes'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BikeRecord[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      setResults(await searchAppwriteBikes(query))
      setSearched(true)
    } catch {
      setError('The live registry could not be searched. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <DemoShell active="Search registry"><div className="page-heading compact-heading"><div><p className="eyebrow dark-eyebrow">Public registry</p><h1>Search the <span>trace.</span></h1><p>Check a serial number, brand or model before you buy, sell or insure a bike.</p></div><span className="secure-note"><FiCheck /> Live Appwrite registry</span></div>
    <form className="registry-search-form" onSubmit={submit}><div className="large-search-input"><FiSearch /><input required value={query} onChange={event => setQuery(event.target.value)} placeholder="Search serial number, brand or model" /><button className="button button-green" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search registry'} <FiArrowRight /></button></div></form>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <div className="results-header"><div><strong>{!searched ? 'Enter a search above' : `${results.length} ${results.length === 1 ? 'bike' : 'bikes'} found`}</strong>{searched && <span> in live public records</span>}</div></div>
    {searched && results.length === 0 ? <div className="empty-state"><h3>No matching bike records</h3><p>Check the serial number and try again. A clean search does not replace proof of ownership.</p></div> : <div className="result-list">{results.map(bike => <Link className="result-card" href={`/bikes/${bike.$id}`} key={bike.$id}><div className="result-thumb" style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined} /><div className="result-details"><div className="result-card-top"><span className={bike.status === 'stolen' ? 'status status-stolen' : 'status'}>{bike.status === 'stolen' ? <><FiAlertTriangle /> Reported stolen</> : <><FiCheck /> {bike.status}</>}</span><span className="result-date">Added {new Date(bike.createdAt).toLocaleDateString('en-ZA')}</span></div><h2>{bike.brand} {bike.model}</h2><p>{bike.year} · {bike.colour} · {bike.location}</p><span className="serial">Serial <strong>{bike.serialNumber}</strong></span></div><span className="result-arrow"><FiArrowRight /></span></Link>)}</div>}
    <div className="registry-notice"><span><FiShield /></span><p><strong>Buying second-hand?</strong> A clean search is a good start, but always ask the seller for proof of ownership too.</p><Link href="/#how-it-works">Learn about safe buying <FiArrowRight /></Link></div>
  </DemoShell>
}
