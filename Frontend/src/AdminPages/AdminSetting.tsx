import type { CSSProperties } from 'react'
import { useState } from 'react'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'

type ProfileErrors = Partial<Record<'name' | 'email' | 'phone', string>>
type PasswordErrors = Partial<Record<'current' | 'next' | 'confirm', string>>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AdminSetting = () => {
  const [name, setName] = useState('General Mechanical Works')
  const [email, setEmail] = useState('generalmechanicalworks46@gmail.com')
  const [phone, setPhone] = useState('+977 9876543212')
  const [role] = useState('Super Admin')
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [passwordSaved, setPasswordSaved] = useState(false)

  const validateProfile = () => {
    const next: ProfileErrors = {}
    const n = name.trim()
    const em = email.trim()
    const ph = phone.trim()
    if (!n) next.name = 'Admin name is required.'
    else if (n.length < 2) next.name = 'Name must be at least 2 characters.'
    if (!em) next.email = 'Email is required.'
    else if (!emailRegex.test(em)) next.email = 'Enter a valid email address.'
    if (!ph) next.phone = 'Phone number is required.'
    else if (ph.replace(/\D/g, '').length < 8) next.phone = 'Enter a valid phone number.'
    setProfileErrors(next)
    return Object.keys(next).length === 0
  }

  const onProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfile()) return
    setProfileSaved(true)
    window.setTimeout(() => setProfileSaved(false), 3500)
  }

  const validatePassword = () => {
    const next: PasswordErrors = {}
    if (!currentPassword) next.current = 'Current password is required.'
    if (!newPassword) next.next = 'New password is required.'
    else if (newPassword.length < 8) next.next = 'New password must be at least 8 characters.'
    else if (newPassword === currentPassword) next.next = 'New password must be different from current password.'
    if (!confirmPassword) next.confirm = 'Please confirm the new password.'
    else if (confirmPassword !== newPassword) next.confirm = 'Passwords do not match.'
    setPasswordErrors(next)
    return Object.keys(next).length === 0
  }

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
    window.setTimeout(() => setPasswordSaved(false), 3500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AdminNavbar />
      <main style={ADMIN_MAIN_SCROLL}>
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Settings</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
            Manage admin profile details and security settings.
          </p>
        </div>

        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Admin Settings</h2>

          <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={subTitleStyle}>Admin Profile</h3>
            <form onSubmit={onProfileSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '760px' }}>
              <label style={labelStyle}>
                Admin name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setProfileErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  style={{ ...inputStyle, border: profileErrors.name ? borderError : borderNormal }}
                />
                {profileErrors.name && <span style={errStyle}>{profileErrors.name}</span>}
              </label>

              <label style={labelStyle}>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setProfileErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  style={{ ...inputStyle, border: profileErrors.email ? borderError : borderNormal }}
                />
                {profileErrors.email && <span style={errStyle}>{profileErrors.email}</span>}
              </label>

              <label style={labelStyle}>
                Phone
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setProfileErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  style={{ ...inputStyle, border: profileErrors.phone ? borderError : borderNormal }}
                />
                {profileErrors.phone && <span style={errStyle}>{profileErrors.phone}</span>}
              </label>

              <label style={labelStyle}>
                Role
                <input type="text" value={role} disabled style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }} />
              </label>

              <button type="submit" style={btnPrimary}>
                Save Profile
              </button>
              {profileSaved && (
                <p style={okStyle} role="status">
                  Profile settings saved.
                </p>
              )}
            </form>
          </div>

          <div>
            <h3 style={subTitleStyle}>Change Password</h3>
            <form onSubmit={onChangePassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '760px' }}>
              <label style={labelStyle}>
                Current password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setPasswordErrors((prev) => ({ ...prev, current: undefined }))
                  }}
                  style={{ ...inputStyle, border: passwordErrors.current ? borderError : borderNormal }}
                />
                {passwordErrors.current && <span style={errStyle}>{passwordErrors.current}</span>}
              </label>

              <label style={labelStyle}>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordErrors((prev) => ({ ...prev, next: undefined }))
                  }}
                  style={{ ...inputStyle, border: passwordErrors.next ? borderError : borderNormal }}
                />
                {passwordErrors.next && <span style={errStyle}>{passwordErrors.next}</span>}
              </label>

              <label style={labelStyle}>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordErrors((prev) => ({ ...prev, confirm: undefined }))
                  }}
                  style={{ ...inputStyle, border: passwordErrors.confirm ? borderError : borderNormal }}
                />
                {passwordErrors.confirm && <span style={errStyle}>{passwordErrors.confirm}</span>}
              </label>

              <button type="submit" style={btnPrimary}>
                Update Password
              </button>
              {passwordSaved && (
                <p style={okStyle} role="status">
                  Password changed successfully.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

const borderNormal = '1px solid #cbd5e1'
const borderError = '1px solid #dc2626'

const cardStyle: CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '28px',
}

const cardTitleStyle: CSSProperties = {
  margin: '0 0 14px',
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
}

const subTitleStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#1e293b',
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: borderNormal,
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const errStyle: CSSProperties = {
  fontSize: '12px',
  color: '#dc2626',
  fontWeight: 500,
}

const okStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: '#166534',
  fontWeight: 600,
}

const btnPrimary: CSSProperties = {
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  backgroundColor: '#bd162c',
  border: '1px solid #991b1b',
  borderRadius: '8px',
  cursor: 'pointer',
  alignSelf: 'flex-start',
}

export default AdminSetting