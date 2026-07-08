import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL_CLASS, ADMIN_PAGE_SUBTITLE, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminPayments,
  type AdminPaymentMethod,
  type AdminPaymentRecord,
  type AdminPaymentStatus,
} from '../lib/api'

const formatRs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

function MethodBadge({ method }: { method: AdminPaymentMethod }) {
  const map: Record<AdminPaymentMethod, { bg: string; color: string }> = {
    COD: { bg: '#f1f5f9', color: '#475569' },
    eSewa: { bg: '#dcfce7', color: '#166534' },
    Khalti: { bg: '#ede9fe', color: '#5b21b6' },
  }
  const m = map[method]
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: m.bg, color: m.color }}>
      {method}
    </span>
  )
}

function TypeBadge() {
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: '#eef2ff', color: '#4338ca' }}>
      E-commerce
    </span>
  )
}

function StatusBadge({ status }: { status: AdminPaymentStatus }) {
  const map: Record<AdminPaymentStatus, { label: string; bg: string; color: string }> = {
    paid: { label: 'Paid', bg: '#dcfce7', color: '#166534' },
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309' },
  }
  const s = map[status]
  return (
    <span style={{ ...chipBaseStyle, backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

const AdminPayments = () => {
  const { token } = useAuth()
  const [rows, setRows] = useState<AdminPaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [methodFilter, setMethodFilter] = useState<'all' | AdminPaymentMethod>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminPaymentStatus>('all')

  const loadPayments = useCallback(async () => {
    if (!token) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchAdminPayments(token)
      setRows(list)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load payments.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

  const filteredRows = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    return rows.filter((row) => {
      if (methodFilter !== 'all' && row.method !== methodFilter) return false
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        row.reference,
        row.customerName,
        row.customerEmail,
        'e-commerce',
        row.method,
        row.status,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [rows, searchInput, methodFilter, statusFilter])

  const totals = useMemo(() => {
    const paidAmount = filteredRows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
    const pendingAmount = filteredRows.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0)
    const totalAmount = filteredRows.reduce((sum, r) => sum + r.amount, 0)
    return {
      totalCount: filteredRows.length,
      totalAmount,
      paidAmount,
      pendingAmount,
    }
  }, [filteredRows])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="admin-page-root">
      <AdminNavbar />
      <main className={ADMIN_MAIN_SCROLL_CLASS}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={ADMIN_PAGE_TITLE}>Payments</h1>
          <p style={ADMIN_PAGE_SUBTITLE}>
            E-commerce order payments — COD, eSewa, and Khalti.
          </p>
        </div>

        <div style={cardStyle}>
          <form
            onSubmit={onSearchSubmit}
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'minmax(220px, 1fr) repeat(2, minmax(140px, 180px))',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order, customer, method..."
              style={inputStyle}
            />
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as 'all' | AdminPaymentMethod)} style={inputStyle}>
              <option value="all">All methods</option>
              <option value="COD">COD</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | AdminPaymentStatus)} style={inputStyle}>
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </form>
        </div>

        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', marginBottom: '14px' }}>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Records</p>
            <p style={metricValueStyle}>{totals.totalCount}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Total amount</p>
            <p style={metricValueStyle}>{formatRs(totals.totalAmount)}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Paid amount</p>
            <p style={{ ...metricValueStyle, color: '#166534' }}>{formatRs(totals.paidAmount)}</p>
          </div>
          <div style={metricCardStyle}>
            <p style={metricLabelStyle}>Pending amount</p>
            <p style={{ ...metricValueStyle, color: '#b45309' }}>{formatRs(totals.pendingAmount)}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Loading payments…
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                          {row.reference}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <TypeBadge />
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.customerName}</span>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{row.customerEmail}</div>
                      </td>
                      <td style={tdStyle}>{row.date}</td>
                      <td style={tdStyle}>
                        <MethodBadge method={row.method} />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{formatRs(row.amount)}</td>
                      <td style={tdStyle}>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No payments match your filters.
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

const cardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '14px',
  marginBottom: '14px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
}

const metricCardStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px',
}

const metricLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: '#64748b',
  fontWeight: 600,
}

const metricValueStyle: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '20px',
  color: '#0f172a',
  fontWeight: 800,
}

const chipBaseStyle: CSSProperties = {
  display: 'inline-block',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontSize: '13px',
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '12px 14px',
  fontSize: '14px',
  color: '#475569',
  verticalAlign: 'top',
}

export default AdminPayments
