'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiMapPin, FiSearch, FiShield } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { BikeRecord, listStolenBikes, searchAppwriteBikes } from '../lib/appwrite/bikes'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') === 'stolen' ? 'stolen' : 'search'
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [mode, setMode] = useState<'search' | 'stolen'>(initialFilter)
  const [searchResults, setSearchResults] = useState<BikeRecord[] | null>(null)
  const [stolenBikes, setStolenBikes] = useState<BikeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStolen() {
      try {
        const stolen = await listStolenBikes(100)
        setStolenBikes(stolen)
      } catch (err) {
        console.error('Failed to load stolen alerts', err)
      }
    }
    void loadStolen()
  }, [])

  // If initial query provided via URL, run search automatically
  useEffect(() => {
    if (initialQuery.trim()) {
      void runSearch(initialQuery.trim())
    }
  }, [initialQuery])

  // If URL filter changes, sync mode
  useEffect(() => {
    if (searchParams.get('filter') === 'stolen') {
      setMode('stolen')
    } else if (searchParams.get('filter') === null && mode === 'stolen' && !initialFilter) {
      setMode('search')
    }
  }, [searchParams])

  async function runSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await searchAppwriteBikes(searchTerm.trim())
      setSearchResults(res)
    } catch {
      setError('The live registry could not be searched. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault()
    void runSearch(query)
  }

  // Filtered stolen bikes if query is active while in stolen mode
  const displayedStolenBikes = useMemo(() => {
    if (!query.trim()) return stolenBikes
    const normalized = query.trim().toLowerCase()
    return stolenBikes.filter(
      (b) =>
        b.serialNumber.toLowerCase().includes(normalized) ||
        b.brand.toLowerCase().includes(normalized) ||
        b.model.toLowerCase().includes(normalized) ||
        b.location.toLowerCase().includes(normalized)
    )
  }, [stolenBikes, query])

  return (
    <DemoShell active={mode === 'stolen' ? 'Stolen alerts' : 'Search registry'}>
      <div className="page-heading compact-heading">
        <div>
          <p className="eyebrow dark-eyebrow">
            {mode === 'stolen' ? 'Community Theft Watch' : 'Public Serial Verification'}
          </p>
          <h1>
            {mode === 'stolen' ? (
              <>
                Reported <span>Stolen Alerts.</span>
              </>
            ) : (
              <>
                Search the <span>trace.</span>
              </>
            )}
          </h1>
          <p>
            {mode === 'stolen'
              ? 'Bicycles reported stolen by verified owners. Look out for these serials and report sightings.'
              : 'Enter a frame serial number, brand, or model before you buy or sell a bicycle.'}
          </p>
        </div>
        <span className="secure-note">
          <FiCheck /> Live verified registry
        </span>
      </div>

      <form className="registry-search-form" onSubmit={handleFormSubmit}>
        <div className="large-search-input">
          <span>
            <FiSearch />
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === 'stolen'
                ? 'Filter stolen bikes by serial, brand, model or city…'
                : 'Search serial number, brand or model…'
            }
          />
          <button className="button button-green" type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search registry'} <FiArrowRight />
          </button>
        </div>
      </form>

      {error && <p className="auth-error" role="alert">{error}</p>}

      {/* Mode navigation toggles */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setMode('search')
            if (searchResults === null && query) {
              void runSearch(query)
            }
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '20px',
            border: mode === 'search' ? '1px solid #173426' : '1px solid #dce4e0',
            background: mode === 'search' ? '#173426' : '#ffffff',
            color: mode === 'search' ? '#ffffff' : '#4f5d56',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FiSearch /> Serial Registry Search
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('stolen')
            setSearchResults(null)
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '20px',
            border: mode === 'stolen' ? '1px solid #d9381e' : '1px solid #fecbc1',
            background: mode === 'stolen' ? '#d9381e' : '#fff5f2',
            color: mode === 'stolen' ? '#ffffff' : '#a84a2d',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FiAlertTriangle /> Stolen Alerts ({stolenBikes.length})
        </button>

        {searchResults !== null && mode === 'search' && (
          <button
            type="button"
            onClick={() => {
              setSearchResults(null)
              setQuery('')
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: '1px dashed #919b97',
              background: '#f0f4f2',
              color: '#4f5d56',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Clear Search Results ×
          </button>
        )}
      </div>

      {/* SCENARIO 1: Search results active */}
      {mode === 'search' && searchResults !== null && (
        <>
          <div className="results-header">
            <div>
              <strong>
                {searchResults.length} {searchResults.length === 1 ? 'bike record' : 'bike records'} found for &quot;{query}&quot;
              </strong>
              <span> in verified registry</span>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="empty-state">
              <h3>No bike records found</h3>
              <p>
                No bicycle in the registry matches &quot;{query}&quot;. A clean search means there are no registered theft flags, but always verify the seller&apos;s physical frame number and proof of purchase.
              </p>
            </div>
          ) : (
            <div className="result-list">
              {searchResults.map((bike) => {
                const isStolen = bike.status === 'stolen'
                return (
                  <Link
                    className="result-card"
                    href={`/bikes/${bike.$id}`}
                    key={bike.$id}
                    style={isStolen ? { borderLeft: '4px solid #d9381e' } : undefined}
                  >
                    <div
                      className="result-thumb"
                      style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined}
                    />
                    <div className="result-details">
                      <div className="result-card-top">
                        <span
                          className={isStolen ? 'status status-stolen' : 'status'}
                          style={
                            isStolen
                              ? { background: '#fff0e9', color: '#ad4c2c', fontWeight: 700 }
                              : undefined
                          }
                        >
                          {isStolen ? (
                            <>
                              <FiAlertTriangle /> Reported stolen
                            </>
                          ) : (
                            <>
                              <FiCheck /> Verified
                            </>
                          )}
                        </span>
                        <span className="result-date">
                          {bike.createdAt
                            ? `Registered ${new Date(bike.createdAt).toLocaleDateString('en-ZA')}`
                            : ''}
                        </span>
                      </div>
                      <h2>
                        {bike.brand} {bike.model}
                      </h2>
                      <p>
                        {bike.year} · {bike.colour} ·{' '}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FiMapPin /> {bike.location}
                        </span>
                      </p>
                      <span className="serial">
                        Serial <strong>{bike.serialNumber}</strong>
                      </span>
                      {isStolen && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#d9381e', fontWeight: 600 }}>
                          ⚠️ Spotted this bike? Click to view full details and report a sighting.
                        </div>
                      )}
                    </div>
                    <span className="result-arrow">
                      <FiArrowRight />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* SCENARIO 2: Stolen Alerts mode active */}
      {mode === 'stolen' && (
        <>
          <div className="results-header">
            <div>
              <strong style={{ color: '#d9381e' }}>
                {displayedStolenBikes.length} {displayedStolenBikes.length === 1 ? 'bicycle' : 'bicycles'} currently flagged as stolen
              </strong>
              <span> across South Africa</span>
            </div>
          </div>

          {displayedStolenBikes.length === 0 ? (
            <div className="empty-state">
              <h3>No stolen bicycles found</h3>
              <p>
                {query.trim()
                  ? `No reported stolen bicycles match "${query}".`
                  : 'Great news! No bicycles are currently reported stolen on the community watch.'}
              </p>
            </div>
          ) : (
            <div className="result-list">
              {displayedStolenBikes.map((bike) => (
                <Link
                  className="result-card"
                  href={`/bikes/${bike.$id}`}
                  key={bike.$id}
                  style={{ borderLeft: '4px solid #d9381e' }}
                >
                  <div
                    className="result-thumb"
                    style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined}
                  />
                  <div className="result-details">
                    <div className="result-card-top">
                      <span
                        className="status status-stolen"
                        style={{ background: '#fff0e9', color: '#ad4c2c', fontWeight: 700 }}
                      >
                        <FiAlertTriangle /> Reported stolen
                      </span>
                      <span className="result-date">
                        {bike.createdAt
                          ? `Registered ${new Date(bike.createdAt).toLocaleDateString('en-ZA')}`
                          : ''}
                      </span>
                    </div>
                    <h2>
                      {bike.brand} {bike.model}
                    </h2>
                    <p>
                      {bike.year} · {bike.colour} ·{' '}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <FiMapPin /> {bike.location}
                      </span>
                    </p>
                    <span className="serial">
                      Serial <strong>{bike.serialNumber}</strong>
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#d9381e', fontWeight: 600 }}>
                      🚨 Spotted this bike? Click to inspect full theft case details and submit a recovery tip.
                    </div>
                  </div>
                  <span className="result-arrow">
                    <FiArrowRight />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* SCENARIO 3: Clean search landing page (no search run, not in stolen mode) */}
      {mode === 'search' && searchResults === null && (
        <div style={{ margin: '30px 0 40px' }}>
          {stolenBikes.length > 0 && (
            <div
              style={{
                marginBottom: '28px',
                padding: '16px 20px',
                background: '#fff5f2',
                border: '1px solid #fecbc1',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    background: '#d9381e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  <FiAlertTriangle />
                </span>
                <div>
                  <strong style={{ color: '#8c220f', fontSize: '13px' }}>
                    Community Theft Watch: {stolenBikes.length} {stolenBikes.length === 1 ? 'bike' : 'bikes'} reported stolen
                  </strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a84a2d' }}>
                    Check serial numbers before buying second-hand to avoid buying stolen property.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="button button-small"
                onClick={() => setMode('stolen')}
                style={{
                  background: '#d9381e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Stolen Alerts ({stolenBikes.length}) →
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  background: '#eefbf3',
                  color: '#167240',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginBottom: '14px',
                }}
              >
                <FiSearch />
              </div>
              <h3 style={{ fontSize: '16px', color: '#121b18', marginBottom: '8px' }}>Locate the Frame Serial</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                On 95% of bicycles, the unique frame serial number is stamped into the metal on the underside of the bottom bracket shell (between the pedals).
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  background: '#eefbf3',
                  color: '#167240',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginBottom: '14px',
                }}
              >
                <FiCheck />
              </div>
              <h3 style={{ fontSize: '16px', color: '#121b18', marginBottom: '8px' }}>Verify Authentic Ownership</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Enter the exact serial number into the search bar above. CycleTrace verifies if the bike is in good standing or flagged stolen.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  background: '#eefbf3',
                  color: '#167240',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  marginBottom: '14px',
                }}
              >
                <FiShield />
              </div>
              <h3 style={{ fontSize: '16px', color: '#121b18', marginBottom: '8px' }}>POPIA Privacy Guaranteed</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                Owner names, telephone numbers, and addresses are strictly confidential. The public registry only confirms authenticity and theft alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="registry-notice">
        <span><FiShield /></span>
        <p>
          <strong>Buying second-hand?</strong> A clean search is a good start, but always ask the seller for a verified CycleTrace ownership transfer too.
        </p>
        <Link href="/#how-it-works">Learn about safe buying <FiArrowRight /></Link>
      </div>
    </DemoShell>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<DemoShell active="Search registry"><div className="empty-state">Loading registry…</div></DemoShell>}>
      <SearchContent />
    </Suspense>
  )
}
