import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { timeSlots } from '../UserComponent/serviceBookingShared'

type DateAvailability = {
  date: string
  slots: string[]
}

function dayNameFromDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString(undefined, { weekday: 'long' })
}

const AdminService = () => {
  const [date, setDate] = useState('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [availability, setAvailability] = useState<DateAvailability[]>([])
  const [error, setError] = useState('')
  const [editingDate, setEditingDate] = useState<string | null>(null)

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]))
  }

  const addAvailability = () => {
    if (!date) {
      setError('Please choose a date first.')
      return
    }
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.')
      return
    }

    setAvailability((prev) => {
      const existing = prev.find((row) => row.date === date)
      if (existing) {
        const merged = Array.from(new Set([...existing.slots, ...selectedSlots]))
        return prev
          .map((row) => (row.date === date ? { ...row, slots: merged } : row))
          .sort((a, b) => a.date.localeCompare(b.date))
      }
      return [...prev, { date, slots: [...selectedSlots] }].sort((a, b) => a.date.localeCompare(b.date))
    })

    setSelectedSlots([])
    setError('')
    setEditingDate(null)
  }

  const removeDate = (targetDate: string) => {
    setAvailability((prev) => prev.filter((row) => row.date !== targetDate))
    if (editingDate === targetDate) {
      setEditingDate(null)
      setDate('')
      setSelectedSlots([])
    }
  }

  const startEdit = (row: DateAvailability) => {
    setDate(row.date)
    setSelectedSlots([...row.slots])
    setEditingDate(row.date)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <h1 style={ADMIN_PAGE_TITLE}>Service</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>Set booking availability for serial dates and time slots.</p>
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <span style={labelStyle}>Available time slots</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {timeSlots.map((slot) => {
                  const active = selectedSlots.includes(slot)
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      style={{
                        border: active ? '1px solid #bd162c' : '1px solid #d1d5db',
                        borderRadius: '999px',
                        padding: '8px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: active ? '#ffffff' : '#475569',
                        backgroundColor: active ? '#bd162c' : '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {error ? <p style={{ margin: '10px 0 0', color: '#b91c1c', fontSize: '13px' }}>{error}</p> : null}

          <div style={{ marginTop: '14px' }}>
            <button type="button" onClick={addAvailability} style={buttonStyle}>
              {editingDate ? 'Update availability' : 'Add availability'}
            </button>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Available schedule ({availability.length} dates)</h2>
          <div style={{ overflowX: 'auto' }}>
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
                {availability.length > 0 ? (
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
                          <button type="button" onClick={() => removeDate(row.date)} style={removeButtonStyle}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>
                      No availability added yet.
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