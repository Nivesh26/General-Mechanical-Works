import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Copyright from '../UserComponent/Copyright'
import Profliephotos from '../UserComponent/Profliephotos'
import Securityform from '../UserComponent/Securityform'
import { initialVehicles } from '../UserComponent/Vehiclesform'
import { useAuth } from '../context/AuthContext'
import { useProfileAvatar } from '../hooks/useProfileAvatar'

function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim()
  if (!t) return { first: 'User', last: '' }
  const i = t.indexOf(' ')
  if (i === -1) return { first: t, last: '' }
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() }
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024

const ProfileSecurity = () => {
  const { user, loading, token, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { avatarUrl, busy: avatarBusy, uploadAvatar, removeAvatar } = useProfileAvatar(
    user,
    token,
    refreshUser,
  )

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true, state: { from: '/profilesecurity' } })
    }
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-600">Loading…</div>
        <Footer />
        <Copyright />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const { first, last } = splitFullName(user.name)

  const handleAvatarFile = async (file: File) => {
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Image must be 2 MB or smaller.')
      return
    }
    try {
      await uploadAvatar(file)
      toast.success('Profile photo updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not upload photo.')
    }
  }

  const handleAvatarDelete = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    try {
      await removeAvatar()
      toast.success('Profile photo removed.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove photo.')
    }
  }

  return (
    <div>
      <Header />

      <div className="mx-[80px]">
        <Profliephotos
          activeTab="security"
          firstName={first}
          lastName={last}
          vehicles={initialVehicles}
          avatarObjectUrl={avatarUrl}
          hasAvatar={user.hasAvatar === true}
          onAvatarFile={handleAvatarFile}
          onAvatarDelete={handleAvatarDelete}
          avatarBusy={avatarBusy}
        />
        <Securityform />
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileSecurity
