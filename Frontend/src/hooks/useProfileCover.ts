import { useCallback, useMemo, useState } from 'react'
import type { UserProfile } from '../lib/api'
import { deleteUserCoverPhoto, toAbsoluteApiUrl, uploadUserCoverPhoto } from '../lib/api'

export function useProfileCover(
  user: UserProfile | null,
  token: string | null,
  refreshUser: () => Promise<void>,
) {
  const [busy, setBusy] = useState(false)

  const coverUrl = useMemo(
    () => toAbsoluteApiUrl(user?.coverPhoto ?? null),
    [user?.coverPhoto],
  )

  const uploadCover = useCallback(
    async (file: File) => {
      if (!token) return
      setBusy(true)
      try {
        await uploadUserCoverPhoto(token, file)
        await refreshUser()
      } finally {
        setBusy(false)
      }
    },
    [token, refreshUser],
  )

  const removeCover = useCallback(async () => {
    if (!token) return
    setBusy(true)
    try {
      await deleteUserCoverPhoto(token)
      await refreshUser()
    } finally {
      setBusy(false)
    }
  }, [token, refreshUser])

  return { coverUrl, busy, uploadCover, removeCover }
}
