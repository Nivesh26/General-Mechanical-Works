export type Role = 'USER' | 'ADMIN'

export type ProfileGender = 'MALE' | 'FEMALE'

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
  gender: ProfileGender | null
  /** ISO date string yyyy-mm-dd */
  dateOfBirth: string | null
  location: string | null
  /** Public path, e.g. /uploads/profiles/abc.png */
  profilePicture: string | null
  /** Public path, e.g. /uploads/covers/abc.png */
  coverPhoto: string | null
  /** True when user has a custom profile image in the database */
  hasAvatar: boolean
}

export type ProfileUpdatePayload = {
  name?: string
  email?: string
  phone?: string
  gender?: ProfileGender
  dateOfBirth?: string
  location?: string
}

export type ProfilePatchResult = {
  profile: UserProfile
  accessToken?: string | null
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse extends UserProfile {
  accessToken: string
  tokenType: string
}

function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string }
    if (data?.message) return data.message
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

export async function authSignup(body: {
  name: string
  email: string
  password: string
  phone?: string
}): Promise<AuthResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AuthResponse>
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AuthResponse>
}

export async function authFetchProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${getApiBase()}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<UserProfile>
}

export async function fetchAdminUsers(token: string): Promise<UserProfile[]> {
  const res = await fetch(`${getApiBase()}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<UserProfile[]>
}

export async function fetchAdminUser(token: string, userId: number): Promise<UserProfile> {
  const res = await fetch(`${getApiBase()}/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<UserProfile>
}

export async function fetchAdminUserVehicles(token: string, userId: number): Promise<ApiVehicleDto[]> {
  const res = await fetch(`${getApiBase()}/api/admin/users/${userId}/vehicles`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiVehicleDto[]>
}

export async function patchUserProfile(
  token: string,
  body: ProfileUpdatePayload,
): Promise<ProfilePatchResult> {
  const res = await fetch(`${getApiBase()}/api/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProfilePatchResult>
}

export async function changePassword(token: string, body: ChangePasswordPayload): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/me/password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function uploadUserAvatar(token: string, file: File): Promise<void> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${getApiBase()}/api/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function uploadUserCoverPhoto(token: string, file: File): Promise<void> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${getApiBase()}/api/auth/me/cover-photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export function toAbsoluteApiUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  const base = getApiBase().replace(/\/+$/, '')
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${path}`
}

export async function deleteUserAvatar(token: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/me/avatar`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function deleteUserCoverPhoto(token: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/me/cover-photo`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type NepaliPlateFormat = 'embossed' | 'traditional'

export type ApiVehicleDto = {
  id: number
  company: string
  model: string
  plate: string
  color: string | null
  plateFormat: NepaliPlateFormat
  isMainBike: boolean
  embossed?: { province: string; category: string; lot: string; digits: string } | null
  traditional?: { zone: string; lot: string; category: string; digits: string } | null
}

export type VehicleUpsertPayload = {
  company: string
  model: string
  plate: string
  color: string
  plateFormat: NepaliPlateFormat
  embossed?: { province: string; category: string; lot: string; digits: string }
  traditional?: { zone: string; lot: string; category: string; digits: string }
}

export async function fetchMyVehicles(token: string): Promise<ApiVehicleDto[]> {
  const res = await fetch(`${getApiBase()}/api/vehicles/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiVehicleDto[]>
}

export async function createVehicle(token: string, body: VehicleUpsertPayload): Promise<ApiVehicleDto> {
  const res = await fetch(`${getApiBase()}/api/vehicles/me`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiVehicleDto>
}

export async function updateVehicle(
  token: string,
  id: number,
  body: VehicleUpsertPayload,
): Promise<ApiVehicleDto> {
  const res = await fetch(`${getApiBase()}/api/vehicles/me/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiVehicleDto>
}

export async function deleteVehicle(token: string, id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/vehicles/me/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function setMainVehicle(token: string, id: number): Promise<ApiVehicleDto[]> {
  const res = await fetch(`${getApiBase()}/api/vehicles/me/${id}/main`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ApiVehicleDto[]>
}
