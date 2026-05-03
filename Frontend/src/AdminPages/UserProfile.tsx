import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import profilePhotoSrc from '../assets/Nivesh.png'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_HEADER_SPACING } from '../AdminComponent/adminMainStyles'

type UserBike = {
  id: string
  company: string
  model: string
  plate: string
  color: string
  isMain: boolean
}

type OrderStatus = 'Completed' | 'Pending' | 'Cancelled'

type ProductOrder = {
  id: string
  product: string
  quantity: number
  date: string
  amount: string
  status: OrderStatus
}

type ServiceStatus = 'Completed' | 'In progress' | 'Scheduled'

type ServiceRecord = {
  id: string
  date: string
  bikeLabel: string
  serviceType: string
  details: string
  status: ServiceStatus
}

type AdminUserProfileData = {
  name: string
  email: string
  phone: string
  location: string
  memberSince: string
  bikes: UserBike[]
  productOrders: ProductOrder[]
  serviceHistory: ServiceRecord[]
}

/** Static profile — same for every user row until API wiring. */
const STATIC_PROFILE: AdminUserProfileData = {
  name: 'Nivesh Shrestha',
  email: 'nivesh@gmail.com',
  phone: '+977 9849925333',
  location: 'Patan, Lalitpur, Nepal',
  memberSince: 'March 2025',
  bikes: [
    {
      id: 'b1',
      company: 'Honda',
      model: 'CB 350',
      plate: 'BA 01 AB 1234',
      color: 'Pearl Nightstar Black',
      isMain: true,
    },
    {
      id: 'b2',
      company: 'Yamaha',
      model: 'R15 V4',
      plate: 'BA 02 CD 5678',
      color: 'Racing Blue',
      isMain: false,
    },
    {
      id: 'b3',
      company: 'Royal Enfield',
      model: 'Classic 350',
      plate: 'BA 03 EF 9012',
      color: 'Gunmetal Grey',
      isMain: false,
    },
  ],
  productOrders: [
    {
      id: 'ord-104',
      product: 'Engine oil (10W-40) — Motul',
      quantity: 2,
      date: '28 Apr 2026',
      amount: 'NPR 3,400',
      status: 'Pending',
    },
    {
      id: 'ord-089',
      product: 'Brake pads — front (Honda CB 350)',
      quantity: 1,
      date: '12 Mar 2026',
      amount: 'NPR 4,200',
      status: 'Completed',
    },
    {
      id: 'ord-071',
      product: 'Chain & sprocket kit',
      quantity: 1,
      date: '3 Feb 2026',
      amount: 'NPR 12,500',
      status: 'Completed',
    },
  ],
  serviceHistory: [
    {
      id: 'srv-221',
      date: '15 Apr 2026',
      bikeLabel: 'Honda CB 350 · BA 01 AB 1234',
      serviceType: 'Full service & tune-up',
      details: 'Oil change, filter, chain clean, brake check; all fluids topped.',
      status: 'Completed',
    },
    {
      id: 'srv-198',
      date: '2 Apr 2026',
      bikeLabel: 'Yamaha R15 V4 · BA 02 CD 5678',
      serviceType: 'Electrical diagnostic',
      details: 'Battery test OK; replaced faulty indicator relay.',
      status: 'Completed',
    },
    {
      id: 'srv-205',
      date: '30 Apr 2026',
      bikeLabel: 'Royal Enfield Classic 350 · BA 03 EF 9012',
      serviceType: 'Clutch cable & adjustment',
      details: 'Scheduled — customer drop-off 10:00 AM.',
      status: 'Scheduled',
    },
  ],
}

function orderStatusStyle(status: OrderStatus): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  }
  if (status === 'Completed') return { ...base, backgroundColor: '#dcfce7', color: '#166534' }
  if (status === 'Pending') return { ...base, backgroundColor: '#fef3c7', color: '#92400e' }
  return { ...base, backgroundColor: '#f1f5f9', color: '#64748b' }
}

function serviceStatusStyle(status: ServiceStatus): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
  }
  if (status === 'Completed') return { ...base, backgroundColor: '#dcfce7', color: '#166534' }
  if (status === 'In progress') return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' }
  return { ...base, backgroundColor: '#e0e7ff', color: '#3730a3' }
}

const cardShell: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
}

const AdminUserProfile = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div style={ADMIN_PAGE_HEADER_SPACING}>
          <Link
            to="/adminusers"
            style={{
              display: 'inline-block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#bd162c',
              textDecoration: 'none',
            }}
          >
            ← Back to Users
          </Link>
        </div>

        <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                alignItems: 'flex-start',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: '140px',
                  height: '140px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid #e2e8f0',
                  backgroundColor: '#f1f5f9',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
                }}
              >
                <img
                  src={profilePhotoSrc}
                  alt={STATIC_PROFILE.name}
                  width={140}
                  height={140}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
                  {STATIC_PROFILE.name}
                </h2>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Email:</span>{' '}
                  <a href={`mailto:${STATIC_PROFILE.email}`} style={{ color: '#bd162c', fontWeight: 500 }}>
                    {STATIC_PROFILE.email}
                  </a>
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Phone:</span>{' '}
                  <a href={`tel:${STATIC_PROFILE.phone.replace(/\s/g, '')}`} style={{ color: '#0f172a' }}>
                    {STATIC_PROFILE.phone}
                  </a>
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Location:</span> {STATIC_PROFILE.location}
                </p>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
                  Member since {STATIC_PROFILE.memberSince}
                </p>
                <Link
                  to="/adminmessages"
                  style={{
                    display: 'inline-block',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    backgroundColor: '#bd162c',
                    border: '1px solid #991b1b',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  Message
                </Link>
              </div>
            </div>

            <div style={cardShell}>
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  Registered bikes ({STATIC_PROFILE.bikes.length})
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ ...th, width: '48px', textAlign: 'center' }}>No.</th>
                      <th style={th}>Brand</th>
                      <th style={th}>Model</th>
                      <th style={th}>License plate</th>
                      <th style={th}>Color</th>
                      <th style={th}>Primary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATIC_PROFILE.bikes.map((bike, index) => (
                      <tr key={bike.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ ...td, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={td}>{bike.company}</td>
                        <td style={td}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{bike.model}</span>
                        </td>
                        <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>
                          {bike.plate}
                        </td>
                        <td style={td}>{bike.color}</td>
                        <td style={td}>
                          {bike.isMain ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                              }}
                            >
                              Main bike
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ ...cardShell, marginTop: '24px' }}>
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  Product orders
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Parts and products linked to this customer (purchased or pending).
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ ...th, width: '48px', textAlign: 'center' }}>No.</th>
                      <th style={th}>Order</th>
                      <th style={th}>Product</th>
                      <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                      <th style={th}>Date</th>
                      <th style={th}>Amount</th>
                      <th style={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATIC_PROFILE.productOrders.map((order, index) => (
                      <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ ...td, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>
                          {order.id}
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{order.product}</span>
                        </td>
                        <td style={{ ...td, textAlign: 'center' }}>{order.quantity}</td>
                        <td style={td}>{order.date}</td>
                        <td style={td}>{order.amount}</td>
                        <td style={td}>
                          <span style={orderStatusStyle(order.status)}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ ...cardShell, marginTop: '24px' }}>
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  Service history
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Workshop visits and maintenance records for this customer.
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ ...th, width: '48px', textAlign: 'center' }}>No.</th>
                      <th style={th}>Date</th>
                      <th style={th}>Bike</th>
                      <th style={th}>Service</th>
                      <th style={th}>Details</th>
                      <th style={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATIC_PROFILE.serviceHistory.map((row, index) => (
                      <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ ...td, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={td}>{row.date}</td>
                        <td style={td}>
                          <span style={{ fontWeight: 500, color: '#334155' }}>{row.bikeLabel}</span>
                        </td>
                        <td style={td}>{row.serviceType}</td>
                        <td style={{ ...td, maxWidth: '280px' }}>{row.details}</td>
                        <td style={td}>
                          <span style={serviceStatusStyle(row.status)}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      </main>
    </div>
  )
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const td: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'middle',
}

export default AdminUserProfile
