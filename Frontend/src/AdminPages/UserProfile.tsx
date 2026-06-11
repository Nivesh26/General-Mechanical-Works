import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_HEADER_SPACING } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminUser,
  fetchAdminUserOrders,
  fetchAdminUserVehicles,
  toAbsoluteApiUrl,
  type AdminOrder,
  type ApiOrderStatus,
  type ApiVehicleDto,
  type ProfileGender,
  type UserProfile,
} from '../lib/api'
import { profileInitialFromName } from '../lib/profileInitial'

type UserBike = {
  id: string
  company: string
  model: string
  plate: string
  color: string
  isMain: boolean
}

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

type ProductOrder = {
  id: string
  orderNumber: string
  product: string
  quantity: number
  date: string
  amount: string
  paymentMethod: 'COD' | 'eSewa' | 'Khalti'
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

type UserSectionTab = 'bikes' | 'orders' | 'history'

const API_TO_ORDER_STATUS: Record<ApiOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

/** Service history — static until that table exists. */
const STATIC_SERVICE_HISTORY: ServiceRecord[] = [
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
]

function displayOrDash(value: string | null | undefined): string {
  const t = value?.trim()
  return t ? t : '—'
}

function genderDisplay(g: ProfileGender | null | undefined): string {
  if (g === 'MALE') return 'Male'
  if (g === 'FEMALE') return 'Female'
  return '—'
}

function dateOfBirthDisplay(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function vehicleToAdminBike(v: ApiVehicleDto): UserBike {
  return {
    id: String(v.id),
    company: v.company,
    model: v.model,
    plate: v.plate,
    color: v.color?.trim() ? v.color : '—',
    isMain: v.isMainBike,
  }
}

function formatOrderDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatNpr(amount: number) {
  return `NPR ${amount.toLocaleString('en-IN')}`
}

function mapOrdersToProductOrders(orders: AdminOrder[]): ProductOrder[] {
  const rows: ProductOrder[] = []
  for (const order of orders) {
    const date = formatOrderDate(order.placedAt)

    order.items.forEach((item, index) => {
      const lineTotal = Number(item.unitPrice) * item.quantity
      const status: OrderStatus = item.cancelled || order.status === 'CANCELLED'
        ? 'cancelled'
        : API_TO_ORDER_STATUS[order.status]
      const paymentMethod: ProductOrder['paymentMethod'] =
        order.paymentMethod === 'COD' ? 'COD' : 'COD'

      rows.push({
        id: String(item.id ?? `${order.id}-${index}`),
        orderNumber: order.orderNumber,
        product: item.productName,
        quantity: item.quantity,
        date,
        amount: formatNpr(lineTotal),
        paymentMethod,
        status,
      })
    })
  }
  return rows.sort((a, b) => {
    if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
    if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
    return b.date.localeCompare(a.date)
  })
}

function orderStatusStyle(status: OrderStatus): CSSProperties {
  const map: Record<OrderStatus, { label: string; bg: string; color: string }> = {
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
    confirmed: { label: 'Confirmed', bg: '#dbeafe', color: '#1d4ed8' },
    shipped: { label: 'Shipped', bg: '#e0e7ff', color: '#4338ca' },
    delivered: { label: 'Delivered', bg: '#dcfce7', color: '#166534' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c' },
  }
  const s = map[status]
  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: s.bg,
    color: s.color,
  }
}

function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status]
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

function paymentMethodStyle(method: ProductOrder['paymentMethod']): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.2,
  }
  if (method === 'COD') return { ...base, backgroundColor: '#e2e8f0', color: '#475569' }
  if (method === 'eSewa') return { ...base, backgroundColor: '#bbf7d0', color: '#166534' }
  return { ...base, backgroundColor: '#ddd6fe', color: '#5b21b6' }
}

const cardShell: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
}

const AdminUserProfile = () => {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const userIdParam = searchParams.get('userId')
  const userId = userIdParam ? Number.parseInt(userIdParam, 10) : Number.NaN

  const [activeTab, setActiveTab] = useState<UserSectionTab>('bikes')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bikes, setBikes] = useState<UserBike[]>([])
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [bikesLoading, setBikesLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!token || !Number.isFinite(userId)) {
      setUser(null)
      setBikes([])
      setOrders([])
      setLoading(false)
      setBikesLoading(false)
      setOrdersLoading(false)
      if (!Number.isFinite(userId)) {
        setError('No user selected. Open a profile from the Users list.')
      }
      return
    }
    setLoading(true)
    setBikesLoading(true)
    setOrdersLoading(true)
    setError(null)
    try {
      const [profile, vehicles, userOrders] = await Promise.all([
        fetchAdminUser(token, userId),
        fetchAdminUserVehicles(token, userId),
        fetchAdminUserOrders(token, userId),
      ])
      setUser(profile)
      setBikes(vehicles.map(vehicleToAdminBike))
      setOrders(mapOrdersToProductOrders(userOrders))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user profile')
      setUser(null)
      setBikes([])
      setOrders([])
    } finally {
      setLoading(false)
      setBikesLoading(false)
      setOrdersLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const avatarImageUrl = useMemo(() => {
    if (user?.profilePicture) {
      return toAbsoluteApiUrl(user.profilePicture)
    }
    return null
  }, [user])

  const profileInitial = user ? profileInitialFromName(user.name) : 'U'

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
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

        {error ? (
          <p style={{ color: '#b91c1c', fontSize: '14px', marginBottom: '16px' }}>
            {error}{' '}
            {Number.isFinite(userId) ? (
              <button
                type="button"
                onClick={() => void loadProfile()}
                style={{
                  marginLeft: '8px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#bd162c',
                  backgroundColor: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            ) : null}
          </p>
        ) : null}

        {loading ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading profile…</p>
        ) : user ? (
          <>
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
                {avatarImageUrl ? (
                  <img
                    src={avatarImageUrl}
                    alt={user.name}
                    width={140}
                    height={140}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#e2e8f0',
                      color: '#bd162c',
                      fontSize: '56px',
                      fontWeight: 700,
                      userSelect: 'none',
                    }}
                  >
                    {profileInitial}
                  </div>
                )}
              </div>
              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
                  {user.name}
                </h2>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Email:</span>{' '}
                  <a href={`mailto:${user.email}`} style={{ color: '#bd162c', fontWeight: 500 }}>
                    {user.email}
                  </a>
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Phone:</span>{' '}
                  {user.phone ? (
                    <a href={`tel:${user.phone.replace(/\s/g, '')}`} style={{ color: '#0f172a' }}>
                      {user.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Date of Birth:</span>{' '}
                  {dateOfBirthDisplay(user.dateOfBirth)}
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Gender:</span>{' '}
                  {genderDisplay(user.gender)}
                </p>
                <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#475569' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Location:</span>{' '}
                  {displayOrDash(user.location)}
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

            <div style={{ ...cardShell, marginTop: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  padding: '0 18px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                }}
              >
                {[
                  { key: 'bikes' as const, label: 'REGISTERED BIKES' },
                  { key: 'orders' as const, label: 'PRODUCT ORDERS' },
                  { key: 'history' as const, label: 'SERVICE HISTORY' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        border: 'none',
                        borderBottom: isActive ? '2px solid #bd162c' : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: isActive ? '#1e293b' : '#475569',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.02em',
                        padding: '14px 0 12px',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {activeTab === 'bikes' && (
                <div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      Registered bikes ({bikes.length})
                    </h3>
                  </div>
                  <div className="admin-table-wrap">
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
                        {bikesLoading ? (
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={td} colSpan={6}>
                              Loading bikes…
                            </td>
                          </tr>
                        ) : bikes.length > 0 ? (
                          bikes.map((bike, index) => (
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
                          ))
                        ) : (
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={td} colSpan={6}>
                              No bikes registered for this customer yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      Product orders ({orders.length})
                    </h3>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Parts and products linked to this customer (purchased or pending).
                    </p>
                  </div>
                  <div className="admin-table-wrap">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ ...th, width: '48px', textAlign: 'center' }}>No.</th>
                          <th style={th}>Order</th>
                          <th style={th}>Product</th>
                          <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                          <th style={th}>Date</th>
                          <th style={th}>Payment</th>
                          <th style={th}>Amount</th>
                          <th style={th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersLoading ? (
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={td} colSpan={8}>
                              Loading product orders…
                            </td>
                          </tr>
                        ) : orders.length > 0 ? (
                          orders.map((order, index) => (
                            <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                              <td style={{ ...td, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                {index + 1}
                              </td>
                              <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>
                                {order.orderNumber}
                              </td>
                              <td style={td}>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{order.product}</span>
                              </td>
                              <td style={{ ...td, textAlign: 'center' }}>{order.quantity}</td>
                              <td style={td}>{order.date}</td>
                              <td style={td}>
                                <span style={paymentMethodStyle(order.paymentMethod)}>{order.paymentMethod}</span>
                              </td>
                              <td style={td}>{order.amount}</td>
                              <td style={td}>
                                <span style={orderStatusStyle(order.status)}>{orderStatusLabel(order.status)}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={td} colSpan={8}>
                              No product orders for this customer yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Service history</h3>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Workshop visits and maintenance records for this customer.
                    </p>
                  </div>
                  <div className="admin-table-wrap">
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
                        {STATIC_SERVICE_HISTORY.map((row, index) => (
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
              )}
            </div>
          </>
        ) : !error ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>User not found.</p>
        ) : null}
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
