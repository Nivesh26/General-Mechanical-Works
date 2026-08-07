import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  deleteAdminServiceAvailability,
  fetchAdminServiceAvailability,
  upsertAdminServiceAvailability,
  type ServiceAvailabilityDay,
} from '../lib/api'

const BOOKING_WINDOW_DAYS = 5

/** Convert HTML time / hour value to on-the-hour label like "1:00 AM", "4:00 PM". */
function formatHourLabel(hhmm: string): string | null {
  const match = /^(\d{1,2})(?::(\d{2}))?$/.exec(hhmm.trim())
  if (!match) return null
  let hour = Number(match[1])
  const minute = match[2] != null ? Number(match[2]) : 0
  if (!Number.isFinite(hour) || hour < 0 || hour > 23 || minute !== 0) {
    return null
  }
  const suffix = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:00 ${suffix}`
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`
  const label = formatHourLabel(value)!
  return { value, label }
})

function slotSortKey(label: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim())
  if (!m) return 0
  let h = Number(m[1])
  const min = Number(m[2])
  const ampm = m[3].toUpperCase()
  if (ampm === 'AM') {
    if (h === 12) h = 0
  } else if (h !== 12) {
    h += 12
  }
  return h * 60 + min
}

function dayNameFromDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString(undefined, { weekday: 'long' })
}

const AdminService = () => {
  const { token } = useAuth()
  const [date, setDate] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [availability, setAvailability] = useState<ServiceAvailabilityDay[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingDate, setEditingDate] = useState<string | null>(null)

  const { minDate, maxDate } = useMemo(() => {
    const toLocalYmd = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const today = new Date()
    const max = new Date(today)
    max.setDate(max.getDate() + (BOOKING_WINDOW_DAYS - 1))
    return {
      minDate: toLocalYmd(today),
      maxDate: toLocalYmd(max),
    }
  }, [])

  const sortedSlots = useMemo(
    () => [...selectedSlots].sort((a, b) => slotSortKey(a) - slotSortKey(b)),
    [selectedSlots],
  )

  const loadAvailability = useCallback(async () => {
    if (!token) {
      setAvailability([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchAdminServiceAvailability(token)
      setAvailability(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load availability')
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadAvailability()
  }, [loadAvailability])

  const addTimeSlot = () => {
    const label = formatHourLabel(timeInput)
    if (!label) {
      setError('Choose an hour first.')
      return
    }
    setError('')
    setSelectedSlots((prev) => (prev.includes(label) ? prev : [...prev, label]))
    setTimeInput('')
  }

  const removeSlot = (slot: string) => {
    setSelectedSlots((prev) => prev.filter((s) => s !== slot))
  }

  const addAvailability = async () => {
    if (!token) return
    if (!date) {
      setError('Please choose a date first.')
      return
    }
    if (selectedSlots.length === 0) {
      setError('Please add at least one time slot.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const saved = await upsertAdminServiceAvailability(token, {
        date,
        slots: [...selectedSlots].sort((a, b) => slotSortKey(a) - slotSortKey(b)),
      })
      setAvailability((prev) => {
        const next = prev.filter((row) => row.date !== saved.date)
        return [...next, saved].sort((a, b) => a.date.localeCompare(b.date))
      })
      setSelectedSlots([])
      setTimeInput('')
      setEditingDate(null)
      toast.success(editingDate ? 'Availability updated.' : 'Availability added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save availability')
    } finally {
      setSaving(false)
    }
  }

  const removeDate = async (targetDate: string) => {
    if (!token) return
    if (!window.confirm(`Remove availability for ${targetDate}?`)) return
    try {
      await deleteAdminServiceAvailability(token, targetDate)
      setAvailability((prev) => prev.filter((row) => row.date !== targetDate))
      if (editingDate === targetDate) {
        setEditingDate(null)
        setDate('')
        setSelectedSlots([])
        setTimeInput('')
      }
      toast.success('Availability removed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove availability')
    }
  }

  const startEdit = (row: ServiceAvailabilityDay) => {
    setDate(row.date)
    setSelectedSlots([...row.slots])
    setTimeInput('')
    setEditingDate(row.date)
    setError('')
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Service</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>
            Set booking availability for the upcoming {BOOKING_WINDOW_DAYS} days. Customers can only book the dates and
            time slots you enable here.
          </p>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Set available date & time</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginTop: '16px' }}>
            <div>
              <label htmlFor="admin-service-date" style={labelStyle}>
                Available date
              </label>
              <input
                id="admin-service-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>
                You can configure today through the next {BOOKING_WINDOW_DAYS - 1} days.
              </p>
            </div>
            <div>
              <span style={labelStyle}>Available time slots</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  id="admin-service-time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', minWidth: '160px' }}
                  aria-label="Add hour"
                >
                  <option value="">Select hour…</option>
                  {HOUR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={selectedSlots.includes(opt.label)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  style={{
                    border: '1px solid #bd162c',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    backgroundColor: '#bd162c',
                    cursor: 'pointer',
                  }}
                >
                  Add time
                </button>
              </div>
              {sortedSlots.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {sortedSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => removeSlot(slot)}
                      title="Remove this time"
                      style={{
                        border: '1px solid #bd162c',
                        borderRadius: '999px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: '#bd162c',
                        cursor: 'pointer',
                      }}
                    >
                      {slot} ×
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#94a3b8' }}>No times added yet.</p>
              )}
            </div>
          </div>

          {error ? <p style={{ margin: '10px 0 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p> : null}

          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => void addAvailability()}
              disabled={saving}
              style={{ ...buttonStyle, opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
            >
              {saving ? 'Saving…' : editingDate ? 'Update availability' : 'Add availability'}
            </button>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Available schedule ({availability.length} dates)</h2>
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ ...thStyle, width: '52px', textAlign: 'center' }}>No.</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Day</th>
                  <th style={thStyle}>Time slots</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      Loading availability…
                    </td>
                  </tr>
                ) : availability.length > 0 ? (
                  availability.map((row, index) => (
                    <tr key={row.date} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{index + 1}</td>
                      <td style={tdStyle}>{row.date}</td>
                      <td style={tdStyle}>{dayNameFromDate(row.date)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {row.slots.map((slot) => (
                            <span key={`${row.date}-${slot}`} style={slotChipStyle}>
                              {slot}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEdit(row)} style={editButtonStyle}>
                            Edit
                          </button>
                          <button type="button" onClick={() => void removeDate(row.date)} style={removeButtonStyle}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      No availability added yet for the upcoming {BOOKING_WINDOW_DAYS} days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '14px',
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
  color: '#1e293b',
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#475569',
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '10px 12px',
  fontSize: '16px',
  color: '#334155',
  boxSizing: 'border-box',
}

const buttonStyle: CSSProperties = {
  padding: '10px 14px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
}

const removeButtonStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#b91c1c',
  backgroundColor: '#fff',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  cursor: 'pointer',
}

const editButtonStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#1d4ed8',
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  cursor: 'pointer',
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'top',
}

const slotChipStyle: CSSProperties = {
  display: 'inline-block',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
  backgroundColor: '#f1f5f9',
  color: '#475569',
}

export default AdminService
