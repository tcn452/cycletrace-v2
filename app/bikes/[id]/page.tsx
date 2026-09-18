'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { FiAlertTriangle, FiArrowRight, FiArrowUpRight, FiCheck } from 'react-icons/fi'
import { DemoShell } from '../../components/DemoShell'
import { BikeRecord, getAppwriteBike } from '../../lib/appwrite/bikes'

export default function BikeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [bike, setBike] = useState<BikeRecord | null>()
  useEffect(() => { getAppwriteBike(id).then(setBike) }, [id])
  if (bike === undefined) return <DemoShell active="Search registry"><div className="empty-state">Loading live record…</div></DemoShell>
  if (bike === null) return <DemoShell active="Search registry"><div className="empty-state"><h3>Bike record not found</h3><p>This record does not exist or is not publicly readable.</p><Link className="button button-dark" href="/search">Back to registry</Link></div></DemoShell>
  const stolen = bike.status === 'stolen'
  const sightingMailto = `mailto:reports@cycletrace.co.za?subject=${encodeURIComponent(
    `SIGHTING OF STOLEN BIKE: ${bike.brand} ${bike.model} (${bike.serialNumber})`
  )}&body=${encodeURIComponent(
    `Hello CycleTrace Team,\n\nI am reporting information or a sighting of stolen bike ${bike.brand} ${bike.model} (Serial: ${bike.serialNumber}).\n\nWhere spotted:\nDate and Time:\nAdditional Details:\nMy Contact Info:\n`
  )}`

  return (
    <DemoShell active="Search registry">
      <Link className="back-link" href="/search">
        ← Back to search
      </Link>
      <div className="bike-detail-grid">
        <div>
          <div
            className="detail-photo"
            style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined}
          >
            <span
              className={stolen ? 'status status-stolen' : 'status'}
              style={stolen ? { background: '#fff0e9', color: '#ad4c2c', fontWeight: 700 } : undefined}
            >
              {stolen ? (
                <>
                  <FiAlertTriangle /> Reported stolen
                </>
              ) : (
                <>
                  <FiCheck /> {bike.status}
                </>
              )}
            </span>
          </div>
          <div className="photo-caption">Public verified record · CycleTrace registry</div>
        </div>
        <div className="bike-detail-copy">
          <p className="eyebrow dark-eyebrow">Registry record · {bike.$id.toUpperCase()}</p>
          <h1>
            {bike.brand}
            <br />
            <span>{bike.model}</span>
          </h1>
          <p className="detail-intro">
            Confirm the serial number matches the frame before continuing with a purchase.
          </p>
          <div className="detail-facts">
            <div>
              <span>Serial number</span>
              <strong style={{ fontFamily: 'monospace' }}>{bike.serialNumber}</strong>
            </div>
            <div>
              <span>Year</span>
              <strong>{bike.year}</strong>
            </div>
            <div>
              <span>Colour</span>
              <strong>{bike.colour}</strong>
            </div>
            <div>
              <span>Last known location</span>
              <strong>{bike.location}</strong>
            </div>
          </div>
          {stolen ? (
            <div className="alert-box alert-danger" style={{ borderLeft: '4px solid #d9381e' }}>
              <strong style={{ color: '#8c220f' }}>🚨 This bike has been reported stolen.</strong>
              <p style={{ color: '#a84a2d', margin: '6px 0 12px 0' }}>
                Do not purchase this bike. If you have spotted it or have information regarding its whereabouts, please report it immediately.
              </p>
              <a
                className="button button-small"
                href={sightingMailto}
                style={{
                  background: '#d9381e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                Report Sighting to CycleTrace <FiArrowRight />
              </a>
            </div>
          ) : (
            <div className="alert-box">
              <strong>No theft report is attached to this record.</strong>
              <p>Always verify the seller&apos;s identity and proof of ownership.</p>
            </div>
          )}
          <Link className="button button-dark" href="/register">
            Register your own bike <FiArrowUpRight />
          </Link>
        </div>
      </div>
    </DemoShell>
  )
}
