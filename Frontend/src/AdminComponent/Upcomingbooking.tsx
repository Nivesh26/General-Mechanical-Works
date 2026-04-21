import { Link } from 'react-router-dom'

export type UpcomingBookingRow = {
  id: string
  client: string
  slot: string
  service: string
  status: string
}

const defaultBookingBadgeStyles: Record<string, { color: string; border: string; backgroundColor: string }> = {
  Confirmed: { color: '#166534', border: '#86efac', backgroundColor: '#f0fdf4' },
  Pending: { color: '#9a3412', border: '#fdba74', backgroundColor: '#fff7ed' },
  Rescheduled: { color: '#1d4ed8', border: '#93c5fd', backgroundColor: '#eff6ff' },
  Cancelled: { color: '#991b1b', border: '#fca5a5', backgroundColor: '#fef2f2' },
}

/** Default rows for the Upcoming Bookings card; replace with API data when available. */
export const defaultUpcomingBookings: UpcomingBookingRow[] = [
  {
    id: 'BK-2201',
    client: 'Orbit Fabricators',
    slot: 'Today, 3:30 PM',
    service: 'Machine Installation',
    status: 'Confirmed',
  },
  {
    id: 'BK-2202',
    client: 'Metro Dynamics',
    slot: 'Tomorrow, 10:00 AM',
    service: 'Maintenance Visit',
    status: 'Pending',
  },
  {
    id: 'BK-2203',
    client: 'SteelCore Pvt Ltd',
    slot: 'Thu, 1:15 PM',
    service: 'Safety Inspection',
    status: 'Rescheduled',
  },
  {
    id: 'BK-2204',
    client: 'Rapid Gears',
    slot: 'Fri, 9:45 AM',
    service: 'Repair Consultation',
    status: 'Cancelled',
  },
]

type UpcomingbookingProps = {
  bookings?: UpcomingBookingRow[]
  bookingBadgeStyles?: Record<string, { color: string; border: string; backgroundColor: string }>
}

const Upcomingbooking = ({
  bookings = defaultUpcomingBookings,
  bookingBadgeStyles = defaultBookingBadgeStyles,
}: UpcomingbookingProps) => {
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
        minHeight: 0,
        height: '100%',
      }}
    >
      <h2 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>Upcoming Bookings</h2>
      <p style={{ margin: '0.35rem 0 1rem', color: '#64748b', fontSize: '14px' }}>
        Scheduled field and workshop bookings for your team.
      </p>
      <div style={{ display: 'grid', gap: '0.7rem', flex: 1, minHeight: 0, alignContent: 'start' }}>
        {bookings.map((booking) => {
          const bookingStyle = bookingBadgeStyles[booking.status] ?? {
            color: '#334155',
            border: '#cbd5e1',
            backgroundColor: '#f8fafc',
          }
          return (
            <div
              key={booking.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.8rem',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '0.75rem 0.9rem',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.83rem' }}>
                  {booking.id} - {booking.client}
                </p>
                <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>{booking.service}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {booking.slot}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: bookingStyle.color,
                    fontWeight: 600,
                    padding: '0.24rem 0.58rem',
                    borderRadius: 999,
                    border: `1px solid ${bookingStyle.border}`,
                    backgroundColor: bookingStyle.backgroundColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
        }}
      >
        <Link
          to="/adminappointments"
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
          View All
        </Link>
      </div>
    </article>
  )
}

export default Upcomingbooking
