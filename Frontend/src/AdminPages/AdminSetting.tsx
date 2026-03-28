import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import { useRef, useState } from 'react'
import { HiOutlinePencilSquare } from 'react-icons/hi2'
import AdminNavbar from '../AdminComponent/AdminNavbar'
import { ADMIN_MAIN_SCROLL } from '../AdminComponent/adminMainStyles'

type ProfileErrors = Partial<Record<'name' | 'email' | 'phone', string>>
type PasswordErrors = Partial<Record<'current' | 'next' | 'confirm', string>>

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AVATAR_MAX_BYTES = 2 * 1024 * 1024

function initialsFromName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return 'A'
}

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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const onAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setAvatarError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Image must be 2 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
        setAvatarUrl(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

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

  const onProfileSubmit = (e: FormEvent) => {
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

  const onChangePassword = (e: FormEvent) => {
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
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Settings</h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
              Manage admin profile details and security settings.
            </p>
          </div>

          <section style={{ ...cardStyle, width: '100%', boxSizing: 'border-box' }}>
            <h2 style={cardTitleStyle}>Admin Settings</h2>

            <div style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={subTitleStyle}>Admin Profile</h3>

            <div style={{ marginBottom: '18px' }}>
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                onChange={onAvatarFile}
                style={{ display: 'none' }}
                aria-hidden
              />
              <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: borderNormal,
                      display: 'block',
                      backgroundColor: '#f1f5f9',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      border: borderNormal,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 700,
                      color: '#64748b',
                    }}
                    aria-hidden
                  >
                    {initialsFromName(name)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  aria-label="Change profile picture"
                  style={{
                    position: 'absolute',
                    right: '-2px',
                    bottom: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    backgroundColor: '#bd162c',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  }}
                >
                  <HiOutlinePencilSquare style={{ width: '14px', height: '14px' }} aria-hidden />
                </button>
              </div>
              {avatarError && (
                <p style={{ ...errStyle, margin: '8px 0 0' }} role="alert">
                  {avatarError}
                </p>
              )}
            </div>

            <form
              onSubmit={onProfileSubmit}
              noValidate
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                width: '100%',
              }}
            >
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
            <form
              onSubmit={onChangePassword}
              noValidate
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                width: '100%',
              }}
            >
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
        </div>
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
  padding: '40px 44px',
}

const cardTitleStyle: CSSProperties = {
  margin: '0 0 18px',
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