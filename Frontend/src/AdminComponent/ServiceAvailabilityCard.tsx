import { Link } from 'react-router-dom'

type ServiceAvailabilityRow = {
  date: string
  day: string
  slots: string[]
}

const defaultAvailability: ServiceAvailabilityRow[] = [
  { date: '2026-05-08', day: 'Friday', slots: ['9:00 AM', '11:00 AM'] },
  { date: '2026-05-09', day: 'Saturday', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
  { date: '2026-05-10', day: 'Sunday', slots: ['9:00 AM', '3:00 PM'] },
]

const ServiceAvailabilityCard = () => {
  return (
    <article
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1.2rem',
        boxShadow: '0 5px 18px rgba(15, 23, 42, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Service Availability</h2>
        <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '14px' }}>
          Quick view of upcoming service dates and available slots.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '0.65rem', marginTop: '1rem', flex: 1, alignContent: 'start' }}>
        {defaultAvailability.map((row) => (
          <div
            key={row.date}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '0.7rem 0.85rem',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.84rem' }}>{row.day}</p>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{row.date}</span>
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.76rem', color: '#475569' }}>{row.slots.join('  •  ')}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '0.95rem' }}>
        <Link
          to="/adminservice"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1d4ed8',
            padding: '0.55rem 0.9rem',
            borderRadius: 10,
            border: '1px solid #93c5fd',
            backgroundColor: '#eff6ff',
          }}
        >
          Manage availability
        </Link>
      </div>
    </article>
  )
}

export default ServiceAvailabilityCard
