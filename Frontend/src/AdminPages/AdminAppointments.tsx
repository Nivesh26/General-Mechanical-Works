import type { CSSProperties, FormEvent } from 'react'
import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'

/** Static demo data — replace with API when backend is ready. */
type ServiceAppointmentStatus = 'pending' | 'accepted' | 'declined' | 'completed'

type ServiceAppointment = {
  id: string
  submittedAt: string
  status: ServiceAppointmentStatus
  mode: 'workshop' | 'pickup'
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceId: string
  serviceTitle: string
  date: string
  slot: string
  bikeLabel: string
  notes: string
  pickupLat?: number
  pickupLng?: number
}

const INITIAL_APPOINTMENTS: ServiceAppointment[] = [
  {
    id: 'apt-1001',
    submittedAt: '2026-04-28T08:30:00.000Z',
    status: 'pending',
    mode: 'workshop',
    customerName: 'Ramesh KC',
    customerEmail: 'ramesh.kc@example.com',
    customerPhone: '+977 9811122001',
    serviceId: 'service',
    serviceTitle: 'Service Work',
    date: '2026-05-02',
    slot: '10:00 AM',
    bikeLabel: 'Honda CB 350 — BA 01 1234',
    notes: 'Oil leak check',
  },
  {
    id: 'apt-1002',
    submittedAt: '2026-04-30T11:15:00.000Z',
    status: 'pending',
    mode: 'pickup',
    customerName: 'Anita Sharma',
    customerEmail: 'anita.s@example.com',
    customerPhone: '+977 9840099887',
    serviceId: 'tyre',
    serviceTitle: 'Tyre Repair',
    date: '2026-05-03',
    slot: '2:00 PM',
    bikeLabel: 'Yamaha R15 — BA 02 5678',
    notes: 'Front tyre losing pressure',
    /** Customer pickup @ Virinchi College — https://www.google.com/maps/place/VIRINCHI+COLLEGE/ */
    pickupLat: 27.6727033,
    pickupLng: 85.3185455,
  },
  {
    id: 'apt-1003',
    submittedAt: '2026-04-25T14:00:00.000Z',
    status: 'accepted',
    mode: 'workshop',
    customerName: 'Bikash Thapa',
    customerEmail: 'bikash.t@example.com',
    customerPhone: '+977 9855511220',
    serviceId: 'wash',
    serviceTitle: 'Bike Wash',
    date: '2026-05-04',
    slot: '11:00 AM',
    bikeLabel: 'Royal Enfield Classic 350 — BA 03 9012',
    notes: '',
  },
]

/** General Mechanical Works — fixed workshop (matches Google Maps place listing). */
const WORKSHOP_LOCATION = {
  label: 'General Mechanical Works (Bike Repair and Spareparts)',
  lat: 27.6763269,
  lng: 85.316043,
} as const

/** Single embedded map: driving directions workshop → customer (route on one map). */
function buildDirectionsEmbedSrc(pickupLat: number, pickupLng: number): string {
  const origin = `${WORKSHOP_LOCATION.lat},${WORKSHOP_LOCATION.lng}`
  const destination = `${pickupLat},${pickupLng}`
  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY?.trim()
  if (key) {
    const params = new URLSearchParams({
      key,
      origin,
      destination,
      mode: 'driving',
    })
    return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`
  }
  const q = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg: 'd',
    output: 'embed',
  })
  return `https://www.google.com/maps?${q.toString()}`
}

function StatusBadge({ status }: { status: ServiceAppointmentStatus }) {
  const map: Record<ServiceAppointmentStatus, { label: string; bg: string; color: string }> = {
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
    accepted: { label: 'Accepted', bg: '#dcfce7', color: '#166534' },
    declined: { label: 'Declined', bg: '#fee2e2', color: '#b91c1c' },
    completed: { label: 'Completed', bg: '#e0e7ff', color: '#4338ca' },
  }
  const s = map[status]
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}

function ModeBadge({ mode }: { mode: ServiceAppointment['mode'] }) {
  const label = mode === 'workshop' ? 'Workshop' : 'Pickup'
  const bg = mode === 'workshop' ? '#dcfce7' : '#fef9c3'
  const color = mode === 'workshop' ? '#166534' : '#854d0e'
  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: bg,
        color,
      }}
    >
      {label}
    </span>
  )
}

function formatSubmitted(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

const AdminAppointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<ServiceAppointment[]>(() => [...INITIAL_APPOINTMENTS])
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceAppointmentStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    const rows = appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        a.id,
        a.customerName,
        a.customerEmail,
        a.customerPhone,
        a.serviceTitle,
        a.bikeLabel,
        a.notes,
        a.date,
        a.slot,
        a.mode,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
    return [...rows].sort((a, b) => {
      const aDone = a.status === 'completed' ? 1 : 0
      const bDone = b.status === 'completed' ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      return 0
    })
  }, [appointments, searchInput, statusFilter])

  const counts = useMemo(() => {
    const c: Record<ServiceAppointmentStatus | 'all', number> = {
      all: appointments.length,
      pending: 0,
      accepted: 0,
      declined: 0,
      completed: 0,
    }
    for (const a of appointments) {
      c[a.status] += 1
    }
    return c
  }, [appointments])

  const setStatus = (id: string, next: ServiceAppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)))
  }

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h1 style={ADMIN_PAGE_TITLE}>Appointments</h1>
            <p style={ADMIN_PAGE_SUBTITLE}>Service bookings from customers — accept or decline requests.</p>
          </div>
          <form
            onSubmit={onSearchSubmit}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '8px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search appointment"
              autoComplete="off"
              style={{
                width: '220px',
                maxWidth: 'min(280px, 42vw)',
                minWidth: '120px',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                flex: '0 1 auto',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#bd162c',
                border: '1px solid #991b1b',
                borderRadius: '8px',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Search appointment
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {(
            [
              { key: 'all' as const, label: 'All' },
              { key: 'pending' as const, label: 'Pending' },
              { key: 'accepted' as const, label: 'Accepted' },
              { key: 'declined' as const, label: 'Declined' },
              { key: 'completed' as const, label: 'Completed' },
            ] as const
          ).map(({ key, label }) => {
            const active = statusFilter === key
            const count = counts[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: active ? '1px solid #bd162c' : '1px solid #e2e8f0',
                  background: active ? 'rgba(189, 22, 44, 0.08)' : '#fff',
                  color: active ? '#bd162c' : '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1080px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Mode</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Date / slot</th>
                  <th style={thStyle}>Bike</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const isOpen = expandedId === a.id
                  return (
                    <Fragment key={a.id}>
                      <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                            {a.id}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '13px', color: '#475569' }}>{formatSubmitted(a.submittedAt)}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{a.customerName}</span>
                          {a.customerEmail ? (
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{a.customerEmail}</div>
                          ) : null}
                          {a.customerPhone ? (
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{a.customerPhone}</div>
                          ) : null}
                        </td>
                        <td style={tdStyle}>
                          <ModeBadge mode={a.mode} />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{a.serviceTitle}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '13px', color: '#334155' }}>{a.date}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{a.slot}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '13px', color: '#475569', maxWidth: '220px' }}>{a.bikeLabel}</div>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={a.status} />
                        </td>
                        <td style={{ ...tdStyle, verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            {a.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setStatus(a.id, 'accepted')}
                                  style={btnAccept}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStatus(a.id, 'declined')}
                                  style={btnDecline}
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {a.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => setStatus(a.id, 'completed')}
                                style={btnComplete}
                              >
                                Mark completed
                              </button>
                            )}
                            <button
                              type="button"
                              title={`Open messages for ${a.customerName}`}
                              aria-label={`Open messages for ${a.customerName}`}
                              style={btnMessage}
                              onClick={() =>
                                navigate('/adminmessages', {
                                  state: {
                                    appointmentId: a.id,
                                    customerName: a.customerName,
                                    customerEmail: a.customerEmail || undefined,
                                    customerPhone: a.customerPhone || undefined,
                                  },
                                })
                              }
                            >
                              Message
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedId(isOpen ? null : a.id)}
                              style={btnGhost}
                            >
                              {isOpen ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ backgroundColor: '#fafafa' }}>
                          <td colSpan={9} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '13px', color: '#475569', maxWidth: '1280px' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#334155' }}>Notes: </span>
                                {a.notes.trim() ? a.notes : '—'}
                              </div>
                              {a.mode === 'pickup' && a.pickupLat != null && a.pickupLng != null && (
                                <div style={{ marginTop: '20px' }}>
                                  <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
                                    One map shows the driving route from{' '}
                                    <strong style={{ color: '#334155' }}>{WORKSHOP_LOCATION.label}</strong> to the
                                    customer&apos;s pickup point. Google marks the start and end on the route.
                                  </p>
                                  <div
                                    style={{
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      border: '1px solid #e2e8f0',
                                      maxWidth: 'min(1100px, 100%)',
                                      height: '440px',
                                      backgroundColor: '#e2e8f0',
                                    }}
                                  >
                                    <iframe
                                      title={`Route workshop to pickup — ${a.id}`}
                                      src={buildDirectionsEmbedSrc(a.pickupLat, a.pickupLng)}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 0,
                                        display: 'block',
                                      }}
                                      loading="lazy"
                                      referrerPolicy="no-referrer-when-downgrade"
                                      allowFullScreen
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No appointments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
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

const btnAccept: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnDecline: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#b91c1c',
  backgroundColor: '#fff',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnComplete: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#ffffff',
  backgroundColor: '#166534',
  border: '1px solid #14532d',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnMessage: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#0369a1',
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  cursor: 'pointer',
}

const btnGhost: CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
}

export default AdminAppointments
