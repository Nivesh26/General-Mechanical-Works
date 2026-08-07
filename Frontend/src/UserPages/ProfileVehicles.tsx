import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Copyright from '../UserComponent/Copyright'
import Header from '../UserComponent/Header'
import Footer from '../UserComponent/Footer'
import Profliephotos from '../UserComponent/Profliephotos'
import Vehiclesform, { type VehiclePersistApi } from '../UserComponent/Vehiclesform'
import { useAuth } from '../context/AuthContext'
import { useProfileAvatar } from '../hooks/useProfileAvatar'
import { useProfileCover } from '../hooks/useProfileCover'
import { createVehicle, deleteVehicle, fetchMyVehicles, setMainVehicle, updateVehicle } from '../lib/api'
import { useProfileVehicles } from '../hooks/useProfileVehicles'
import { apiVehicleToForm, formVehicleToPayload } from '../lib/vehicles'
import { PAGE_GUTTER } from '../lib/layoutClasses'

const AVATAR_MAX_BYTES = 2 * 1024 * 1024
const COVER_MAX_BYTES = 4 * 1024 * 1024

function splitFullName(fullName: string): { first: string; last: string } {
  const t = fullName.trim()
  if (!t) return { first: 'User', last: '' }
  const i = t.indexOf(' ')
  if (i === -1) return { first: t, last: '' }
  return { first: t.slice(0, i), last: t.slice(i + 1).trim() }
}

const ProfileVehicles = () => {
  const { user, loading, token, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { vehicles, setVehicles, vehiclesLoading } = useProfileVehicles(
    token,
    Boolean(user && !loading),
  )
  const { avatarUrl, busy: avatarBusy, uploadAvatar, removeAvatar } = useProfileAvatar(
    user,
    token,
    refreshUser,
  )
  const { coverUrl, busy: coverBusy, uploadCover, removeCover } = useProfileCover(
    user,
    token,
    refreshUser,
  )

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true, state: { from: '/profilevehicles' } })
    }
  }, [loading, user, navigate])

  const persistApi = useMemo((): VehiclePersistApi | undefined => {
    if (!token) return undefined
    return {
      onSave: async (vehicle, { isNew }) => {
        const body = formVehicleToPayload(vehicle)
        const saved = isNew || vehicle.id == null
          ? await createVehicle(token, body)
          : await updateVehicle(token, vehicle.id, body)
        toast.success(isNew ? 'Vehicle added.' : 'Vehicle updated.')
        return apiVehicleToForm(saved)
      },
      onDelete: async (vehicle) => {
        if (vehicle.id == null) return
        await deleteVehicle(token, vehicle.id)
        toast.success('Vehicle removed.')
        const list = await fetchMyVehicles(token)
        setVehicles(list.map(apiVehicleToForm))
      },
      onSetMainBike: async (vehicle) => {
        if (vehicle.id == null) return []
        const list = await setMainVehicle(token, vehicle.id)
        toast.success('Main bike updated.')
        return list.map(apiVehicleToForm)
      },
    }
  }, [token])

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

  const handleCoverFile = async (file: File) => {
    if (file.size > COVER_MAX_BYTES) {
      toast.error('Cover image must be 4 MB or smaller.')
      return
    }
    try {
      await uploadCover(file)
      toast.success('Cover photo updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not upload cover photo.')
    }
  }

  const handleCoverDelete = async () => {
    if (!window.confirm('Remove your cover photo?')) return
    try {
      await removeCover()
      toast.success('Cover photo removed.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove cover photo.')
    }
  }

  return (
    <div>
      <Header />

      <div className={PAGE_GUTTER}>
        <Profliephotos
          activeTab="vehicles"
          firstName={first}
          lastName={last}
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
          avatarObjectUrl={avatarUrl}
          hasAvatar={user.hasAvatar === true}
          onAvatarFile={handleAvatarFile}
          onAvatarDelete={handleAvatarDelete}
          avatarBusy={avatarBusy}
          coverObjectUrl={coverUrl}
          hasCoverPhoto={Boolean(user.coverPhoto)}
          onCoverFile={handleCoverFile}
          onCoverDelete={handleCoverDelete}
          coverBusy={coverBusy}
        />
        {vehiclesLoading ? (
          <p className="py-8 text-center text-gray-600">Loading your vehicles…</p>
        ) : (
          <Vehiclesform
            vehicles={vehicles}
            setVehicles={setVehicles}
            persistApi={persistApi}
            busy={vehiclesLoading}
          />
        )}
      </div>

      <Footer />
      <Copyright />
    </div>
  )
}

export default ProfileVehicles
