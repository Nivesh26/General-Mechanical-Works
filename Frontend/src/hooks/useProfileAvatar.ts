import { useCallback, useMemo, useState } from 'react'
import type { UserProfile } from '../lib/api'
import { deleteUserAvatar, toAbsoluteApiUrl, uploadUserAvatar } from '../lib/api'

export function useProfileAvatar(
  user: UserProfile | null,
  token: string | null,
  refreshUser: () => Promise<void>,
) {
  const [busy, setBusy] = useState(false)

  const avatarUrl = useMemo(
    () => toAbsoluteApiUrl(user?.profilePicture ?? null),
    [user?.profilePicture],
  )

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!token) return
      setBusy(true)
      try {
        await uploadUserAvatar(token, file)
        await refreshUser()
      } finally {
        setBusy(false)
      }
    },
    [token, refreshUser],
  )

  const removeAvatar = useCallback(async () => {
    if (!token) return
    setBusy(true)
    try {
      await deleteUserAvatar(token)
      await refreshUser()
    } finally {
      setBusy(false)
    }
  }, [token, refreshUser])

  return { avatarUrl, busy, uploadAvatar, removeAvatar }
}
