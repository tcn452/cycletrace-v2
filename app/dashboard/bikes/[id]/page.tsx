'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, use, useEffect, useState } from 'react'
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiEdit2, FiLock, FiRepeat } from 'react-icons/fi'
import { DemoShell } from '../../../components/DemoShell'
import { BikeRecord, getAppwriteBike, updateAppwriteBikeDetails } from '../../../lib/appwrite/bikes'

function DashboardBikeDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const initialEditMode = searchParams.get('edit') === 'true'

  const [bike, setBike] = useState<BikeRecord | null>()
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Editable fields
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number | string>('')
  const [colour, setColour] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    getAppwriteBike(id).then(data => {
      setBike(data)
      if (data) {
        setBrand(data.brand || '')
        setModel(data.model || '')
        setYear(data.year || '')
        setColour(data.colour || '')
        setLocation(data.location || '')
      }
    })
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!bike) return

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const updated = await updateAppwriteBikeDetails(bike.$id, {
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year) || bike.year,
        colour: colour.trim(),
        location: location.trim(),
      })
      setBike(updated)
      setSuccessMessage('Bicycle details updated successfully.')
      setIsEditing(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update bicycle details.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (bike) {
      setBrand(bike.brand || '')
      setModel(bike.model || '')
      setYear(bike.year || '')
      setColour(bike.colour || '')
      setLocation(bike.location || '')
    }
    setError('')
    setIsEditing(false)
  }

  if (bike === undefined) {
    return (
      <DemoShell showSidebar>
        <div className="empty-state">Loading live record…</div>
      </DemoShell>
    )
  }

  if (!bike) {
    return (
      <DemoShell showSidebar>
        <div className="empty-state">
          <h3>Bike record not found</h3>
          <Link href="/dashboard">Return to dashboard</Link>
        </div>
      </DemoShell>
    )
  }

  return (
    <DemoShell active="My bikes" showSidebar>
      <Link className="back-link" href="/dashboard#bikes">
        <FiArrowLeft /> Back to my bikes
      </Link>

      <div className="workspace-record-heading">
        <div>
          <p className="eyebrow dark-eyebrow">My bike · {bike.$id.toUpperCase()}</p>
          <h1>
            Your <span>bike record.</span>
          </h1>
        </div>
        <span className={bike.status === 'stolen' ? 'status status-stolen' : 'status'}>
          {bike.status === 'protected' && <FiCheck />} {bike.status}
        </span>
      </div>

      {successMessage && (
        <div className="alert-box alert-success" role="status">
          <strong>
            <FiCheck /> Update complete
          </strong>
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="alert-box alert-danger" role="alert">
          <strong>
            <FiAlertTriangle /> Update failed
          </strong>
          <p>{error}</p>
        </div>
      )}

      <div className="workspace-record-grid">
        <div>
          <div
            className="detail-photo"
            style={bike.image ? { backgroundImage: `url(${bike.image})` } : undefined}
          />
        </div>

        <div className="workspace-record-copy">
          <h2>
            {bike.brand} {bike.model}
          </h2>

          {isEditing ? (
            <form className="bike-edit-form" onSubmit={handleSave}>
              <div>
                <h3>Edit bicycle details</h3>
                <p className="edit-helper">
                  Update location if you moved, or refresh bike specifications.
                </p>
              </div>

              <label>
                Location / City
                <input
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Cape Town, Western Cape"
                />
              </label>

              <div className="form-grid-2">
                <label>
                  Brand
                  <input
                    required
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Trek"
                  />
                </label>
                <label>
                  Model
                  <input
                    required
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="e.g. Domane AL 3"
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label>
                  Colour
                  <input
                    required
                    value={colour}
                    onChange={e => setColour(e.target.value)}
                    placeholder="e.g. Matte Olive / Orange"
                  />
                </label>
                <label>
                  Year
                  <input
                    required
                    type="number"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={e => setYear(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Serial number
                <span className="locked-field-badge">
                  <FiLock /> Frame identifier (locked)
                </span>
                <input
                  disabled
                  value={bike.serialNumber}
                  title="Frame serial numbers are permanently registered to preserve provenance."
                />
              </label>

              <div className="edit-actions">
                <button className="button button-green" type="submit" disabled={saving}>
                  {saving ? 'Saving changes…' : 'Save changes'} <FiCheck />
                </button>
                <button
                  className="button button-outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="detail-facts">
                <div>
                  <span>Serial number</span>
                  <strong>{bike.serialNumber}</strong>
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
                  <span>Location</span>
                  <strong>{bike.location}</strong>
                </div>
              </div>

              <div className="record-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setIsEditing(true)
                    setSuccessMessage('')
                    setError('')
                  }}
                >
                  <FiEdit2 /> Edit bike details
                </button>
                <Link
                  className="button button-green"
                  href={`/dashboard/transfer?bike=${bike.$id}`}
                >
                  <FiRepeat /> Transfer ownership
                </Link>
                {bike.status !== 'stolen' && (
                  <Link
                    className="button button-dark"
                    href={`/dashboard/report?bike=${bike.$id}`}
                  >
                    <FiAlertTriangle /> Report stolen
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DemoShell>
  )
}

export default function DashboardBikeDetail(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <DemoShell showSidebar>
          <div className="empty-state">Loading live record…</div>
        </DemoShell>
      }
    >
      <DashboardBikeDetailContent {...props} />
    </Suspense>
  )
}
