import type { CSSProperties } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'
import { useAuth } from '../context/AuthContext'
import { fetchAdminUsers, type UserProfile } from '../lib/api'

function displayOrDash(value: string | null | undefined): string {
  const t = value?.trim()
  return t ? t : '-'
}

function userSearchText(user: UserProfile): string {
  return [
    user.name,
    user.email,
    user.phone ?? '',
    user.role,
    user.gender ?? '',
    user.dateOfBirth ?? '',
    user.location ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

const AdminUsers = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const loadUsers = useCallback(async () => {
    if (!token) {
      setUsers([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminUsers(token)
      setUsers(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter((user) => {
    if (!searchInput.trim()) return true
    return userSearchText(user).includes(searchInput.toLowerCase())
  })

  const colCount = 9

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <h1 style={ADMIN_PAGE_TITLE}>Users</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by any field"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                width: '420px',
                maxWidth: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#bd162c',
                border: '1px solid #991b1b',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </div>
        </div>

        {error ? (
          <p style={{ color: '#b91c1c', fontSize: '14px', marginBottom: '12px' }}>
            {error}{' '}
            <button
              type="button"
              onClick={() => void loadUsers()}
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
          </p>
        ) : null}

        <div
          style={{
            marginTop: '28px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ ...headerCellStyle, width: '52px', textAlign: 'center' }}>No.</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Email</th>
                <th style={headerCellStyle}>Phone</th>
                <th style={headerCellStyle}>Role</th>
                <th style={headerCellStyle}>Gender</th>
                <th style={headerCellStyle}>Date of birth</th>
                <th style={headerCellStyle}>Location</th>
                <th style={headerCellStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={bodyCellStyle} colSpan={colCount}>
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ ...bodyCellStyle, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td style={bodyCellStyle}>
                      <Link
                        to={`/adminuserprofile?userId=${user.id}`}
                        className="admin-users-name-link"
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td style={bodyCellStyle}>{user.email}</td>
                    <td style={bodyCellStyle}>{displayOrDash(user.phone)}</td>
                    <td style={bodyCellStyle}>{user.role}</td>
                    <td style={bodyCellStyle}>{displayOrDash(user.gender)}</td>
                    <td style={bodyCellStyle}>{displayOrDash(user.dateOfBirth)}</td>
                    <td style={bodyCellStyle}>{displayOrDash(user.location)}</td>
                    <td style={bodyCellStyle}>
                      <Link
                        to={`/adminuserprofile?userId=${user.id}`}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#ffffff',
                          backgroundColor: '#bd162c',
                          border: '1px solid #991b1b',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={bodyCellStyle} colSpan={colCount}>
                    {users.length === 0 ? 'No users in the database.' : 'No users match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

const headerCellStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#334155',
  fontWeight: 600,
}

const bodyCellStyle: CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
}

export default AdminUsers
