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
}

export type ProfileUpdatePayload = {
  name?: string
  phone?: string
  gender?: ProfileGender
  dateOfBirth?: string
  location?: string
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

export async function patchUserProfile(
  token: string,
  body: ProfileUpdatePayload,
): Promise<UserProfile> {
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
  return res.json() as Promise<UserProfile>
}
