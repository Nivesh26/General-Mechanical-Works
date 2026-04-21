import type { CSSProperties } from 'react'
import { useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL, ADMIN_PAGE_TITLE } from '../AdminComponent/adminMainStyles'

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      number: '+977 9849925333',
      location: 'Patan, Nepal',
    },
    {
      name: 'Diya Patel',
      email: 'diya.patel@example.com',
      number: '+977 9812345678',
      location: 'Kathmandu, Nepal',
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      number: '+977 9849925333',
      location: 'Pokhara, Nepal',
    },
    {
      name: 'Neha Singh',
      email: 'neha.singh@example.com',
      number: '+977 9849925333',
      location: null,
    },
  ])
  const [searchInput, setSearchInput] = useState('')

  const filteredUsers = users.filter((user) => {
    if (!searchInput.trim()) return true

    const searchableText = `${user.name} ${user.email} ${user.number} ${user.location ?? ''}`.toLowerCase()
    return searchableText.includes(searchInput.toLowerCase())
  })

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
          }}
        >
          <h1 style={ADMIN_PAGE_TITLE}>Users</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, number, location"
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

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Email</th>
                <th style={headerCellStyle}>Number</th>
                <th style={headerCellStyle}>Location</th>
                <th style={headerCellStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.email} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={bodyCellStyle}>{user.name}</td>
                    <td style={bodyCellStyle}>{user.email}</td>
                    <td style={bodyCellStyle}>{user.number}</td>
                    <td style={bodyCellStyle}>{user.location?.trim() ? user.location : '-'}</td>
                    <td style={bodyCellStyle}>
                      <button
                        type="button"
                        onClick={() =>
                          setUsers((prevUsers) =>
                            prevUsers.filter((existingUser) => existingUser.email !== user.email)
                          )
                        }
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#b91c1c',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={bodyCellStyle} colSpan={5}>
                    No users found.
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