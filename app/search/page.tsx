'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiArrowRight, FiCheck, FiMapPin, FiSearch, FiShield } from 'react-icons/fi'
import { DemoShell } from '../components/DemoShell'
import { BikeRecord, listAllPublicBikes, listStolenBikes, searchAppwriteBikes } from '../lib/appwrite/bikes'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') === 'stolen' ? 'stolen' : 'all'
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [filter, setFilter] = useState<'all' | 'stolen' | 'protected'>(initialFilter)
  const [searchResults, setSearchResults] = useState<BikeRecord[] | null>(null)
  const [stolenBikes, setStolenBikes] = useState<BikeRecord[]>([])
  const [allBikes, setAllBikes] = useState<BikeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [stolen, all] = await Promise.all([
          listStolenBikes(100),
          listAllPublicBikes(100),
        ])
        setStolenBikes(stolen)
        setAllBikes(all)
      } catch (err) {
        console.error('Failed to load bikes registry', err)
      }
    }
    void loadPublicData()
  }, [])

  // If initial query provided via URL, run search automatically
  useEffect(() => {
    if (initialQuery.trim()) {
      void runSearch(initialQuery.trim())
    }
  }, [initialQuery])

  // If URL filter changes, sync filter
  useEffect(() => {
    if (searchParams.get('filter') === 'stolen') {
      setFilter('stolen')
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

  // Determine active bike list to display
  const displayedBikes = useMemo(() => {
    let list: BikeRecord[]
    if (searchResults !== null) {
      list = searchResults
    } else if (filter === 'stolen') {
      list = stolenBikes
    } else if (filter === 'protected') {
      list = allBikes.filter((b) => b.status === 'protected')
    } else {
      list = allBikes
    }

    if (filter === 'stolen' && searchResults !== null) {
      return list.filter((b) => b.status === 'stolen')
    }
    if (filter === 'protected' && searchResults !== null) {
      return list.filter((b) => b.status === 'protected')
    }
    return list
  }, [searchResults, filter, stolenBikes, allBikes])

  return (
    <DemoShell active="Search registry">
      <div className="page-heading compact-heading">
        <div>
          <p className="eyebrow dark-eyebrow">Public registry</p>
          <h1>Search the <span>trace.</span></h1>
          <p>Check a serial number, brand or model before you buy, sell, or report a stolen bike.</p>
        </div>
        <span className="secure-note">
          <FiCheck /> Live verified registry
        </span>
      </div>

      <form className="registry-search-form" onSubmit={handleFormSubmit}>
        <div className="large-search-input">
          <FiSearch />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search serial number, brand or model…"
          />
          <button className="button button-green" type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search registry'} <FiArrowRight />
          </button>
        </div>
      </form>

      {error && <p className="auth-error" role="alert">{error}</p>}

      {/* Community theft alert callout if stolen bikes exist */}
      {stolenBikes.length > 0 && (
        <div
          style={{
            margin: '20px 0',
            padding: '14px 18px',
            background: filter === 'stolen' ? '#ffebe6' : '#fff5f2',
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
                Look out for these serial numbers. If you spot one or are offered it, do not purchase.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="button button-small"
            onClick={() => {
              setFilter(filter === 'stolen' ? 'all' : 'stolen')
              setSearchResults(null)
              setQuery('')
            }}
            style={{
              background: filter === 'stolen' ? '#d9381e' : '#ffffff',
              color: filter === 'stolen' ? '#ffffff' : '#8c220f',
              border: '1px solid #fecbc1',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {filter === 'stolen' ? 'Show All Bicycles' : `View ${stolenBikes.length} Stolen Alerts →`}
          </button>
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '7px 14px',
            borderRadius: '20px',
            border: filter === 'all' ? '1px solid #173426' : '1px solid #dce4e0',
            background: filter === 'all' ? '#173426' : '#ffffff',
            color: filter === 'all' ? '#ffffff' : '#4f5d56',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          All Bicycles ({allBikes.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('stolen')}
          style={{
            padding: '7px 14px',
            borderRadius: '20px',
            border: filter === 'stolen' ? '1px solid #d9381e' : '1px solid #fecbc1',
            background: filter === 'stolen' ? '#d9381e' : '#fff5f2',
            color: filter === 'stolen' ? '#ffffff' : '#a84a2d',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FiAlertTriangle /> Stolen Bicycle Alerts ({stolenBikes.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('protected')}
          style={{
            padding: '7px 14px',
            borderRadius: '20px',
            border: filter === 'protected' ? '1px solid #167240' : '1px solid #dce4e0',
            background: filter === 'protected' ? '#167240' : '#ffffff',
            color: filter === 'protected' ? '#ffffff' : '#4f5d56',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Protected ({allBikes.filter((b) => b.status === 'protected').length})
        </button>

        {searchResults !== null && (
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

      <div className="results-header">
        <div>
          <strong>
            {searchResults !== null
              ? `${displayedBikes.length} ${displayedBikes.length === 1 ? 'bike' : 'bikes'} found for "${query}"`
              : filter === 'stolen'
              ? `${displayedBikes.length} ${displayedBikes.length === 1 ? 'bicycle' : 'bicycles'} currently reported stolen`
              : `${displayedBikes.length} ${displayedBikes.length === 1 ? 'bike' : 'bikes'} in live public records`}
          </strong>
          <span> in live verified registry</span>
        </div>
      </div>

      {displayedBikes.length === 0 ? (
        <div className="empty-state">
          <h3>
            {filter === 'stolen'
              ? 'No stolen bicycles found'
              : 'No matching bike records'}
          </h3>
          <p>
            {filter === 'stolen'
              ? 'Great news! No bicycles are currently reported stolen under this filter.'
              : 'Check the serial number and try again. A clean search does not replace proof of ownership.'}
          </p>
        </div>
      ) : (
        <div className="result-list">
          {displayedBikes.map((bike) => {
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
                          <FiCheck /> {bike.status}
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

      <div className="registry-notice">
        <span><FiShield /></span>
        <p>
          <strong>Buying second-hand?</strong> A clean search is a good start, but always ask the seller for proof of ownership too.
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

