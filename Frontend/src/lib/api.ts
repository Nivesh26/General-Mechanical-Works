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

export type LoginPendingResponse = {
  verificationRequired: true
  verificationToken: string | null
  email: string
}

function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
}

export { getApiBase }

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

export async function authLogin(email: string, password: string): Promise<LoginPendingResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<LoginPendingResponse>
}

export async function authVerifyLogin(verificationToken: string, code: string): Promise<AuthResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/login/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ verificationToken, code }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AuthResponse>
}

export async function authResendLoginCode(verificationToken: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/login/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ verificationToken }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function authForgotPassword(email: string): Promise<LoginPendingResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<LoginPendingResponse>
}

export async function authResendForgotPasswordCode(verificationToken: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/forgot-password/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ verificationToken }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function authResetPassword(
  verificationToken: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ verificationToken, code, newPassword }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function submitContactMessage(body: {
  name: string
  phone: string
  email: string
  message: string
}): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function authGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/google`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ idToken }),
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

export async function fetchAdminUserOrders(token: string, userId: number): Promise<AdminOrder[]> {
  const res = await fetch(`${getApiBase()}/api/admin/users/${userId}/orders`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder[]>
}

export async function fetchAdminUserAppointments(
  token: string,
  userId: number,
): Promise<ServiceAppointmentItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/users/${userId}/appointments`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem[]>
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

export type CartItemDto = {
  id: number
  productId: number
  productName: string
  sku: string
  price: number
  quantity: number
  stock: number
  maxQuantity: number
  size: string | null
  imagePaths: string[]
}

export async function fetchMyCart(token: string): Promise<CartItemDto[]> {
  const res = await fetch(`${getApiBase()}/api/cart/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<CartItemDto[]>
}

export async function addToCart(
  token: string,
  body: { productId: number; quantity?: number; size?: string | null },
): Promise<CartItemDto> {
  const res = await fetch(`${getApiBase()}/api/cart/me`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<CartItemDto>
}

export async function updateCartItemQuantity(
  token: string,
  cartItemId: number,
  quantity: number,
): Promise<CartItemDto> {
  const res = await fetch(`${getApiBase()}/api/cart/me/${cartItemId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<CartItemDto>
}

export async function removeCartItem(token: string, cartItemId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/cart/me/${cartItemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function clearCart(token: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/cart/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type BlogSummary = {
  id: number
  title: string
  dateLabel: string
  description: string
  imagePath: string
  likeCount: number
}

export type BlogPost = {
  id: number
  title: string
  dateLabel: string
  body: string
  imagePath: string
  likeCount: number
  likedByCurrentUser: boolean
}

export async function fetchBlogs(): Promise<BlogSummary[]> {
  const res = await fetch(`${getApiBase()}/api/blogs`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogSummary[]>
}

export async function fetchBlog(id: number, token?: string | null): Promise<BlogPost> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${getApiBase()}/api/blogs/${id}`, { headers })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost>
}

export async function likeBlog(id: number, token: string): Promise<BlogPost> {
  const res = await fetch(`${getApiBase()}/api/blogs/${id}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost>
}

export async function unlikeBlog(id: number, token: string): Promise<BlogPost> {
  const res = await fetch(`${getApiBase()}/api/blogs/${id}/like`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost>
}

export async function fetchAdminBlogs(token: string): Promise<BlogPost[]> {
  const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost[]>
}

export async function createAdminBlog(
  token: string,
  fields: { title: string; dateLabel: string; body: string },
  file: File,
): Promise<BlogPost> {
  const body = new FormData()
  body.append('title', fields.title)
  body.append('dateLabel', fields.dateLabel)
  body.append('body', fields.body)
  body.append('file', file)
  const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost>
}

export async function updateAdminBlog(
  token: string,
  id: number,
  fields: { title: string; dateLabel: string; body: string },
  file?: File | null,
): Promise<BlogPost> {
  const body = new FormData()
  body.append('title', fields.title)
  body.append('dateLabel', fields.dateLabel)
  body.append('body', fields.body)
  if (file) body.append('file', file)
  const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<BlogPost>
}

export async function deleteAdminBlog(token: string, id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type OfferItem = {
  id: number
  description: string
  imagePath: string
}

export async function fetchOffers(): Promise<OfferItem[]> {
  const res = await fetch(`${getApiBase()}/api/offers`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<OfferItem[]>
}

export async function fetchAdminOffers(token: string): Promise<OfferItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/offers`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<OfferItem[]>
}

export async function createAdminOffer(
  token: string,
  description: string,
  file: File,
): Promise<OfferItem> {
  const body = new FormData()
  body.append('description', description)
  body.append('file', file)
  const res = await fetch(`${getApiBase()}/api/admin/offers`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<OfferItem>
}

export async function deleteAdminOffer(token: string, id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/offers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type ProductItem = {
  id: number
  sku: string
  name: string
  description: string
  bulletPoints: string[]
  category: string
  sizes: string[]
  price: number
  stock: number
  imagePaths: string[]
  active: boolean
}

export type ProductFormFields = {
  sku: string
  name: string
  description: string
  bulletPoints: string
  category: string
  /** Selected size labels (maps to admin form field `size`). */
  size: string[]
  price: string
  stock: string
}

function appendProductFormFields(body: FormData, fields: ProductFormFields) {
  body.append('sku', fields.sku.trim())
  body.append('name', fields.name.trim())
  body.append('description', fields.description.trim())
  body.append('bulletPoints', fields.bulletPoints)
  body.append('category', fields.category.trim())
  body.append('sizes', (fields.size ?? []).join(','))
  body.append('price', fields.price.trim())
  body.append('stock', fields.stock.trim())
}

export async function fetchProducts(): Promise<ProductItem[]> {
  const res = await fetch(`${getApiBase()}/api/products`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem[]>
}

export async function fetchProduct(id: number): Promise<ProductItem> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem>
}

export async function fetchAdminProducts(token: string): Promise<ProductItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem[]>
}

export async function createAdminProduct(
  token: string,
  fields: ProductFormFields,
  files: File[],
): Promise<ProductItem> {
  const body = new FormData()
  appendProductFormFields(body, fields)
  for (const file of files) {
    body.append('files', file)
  }
  const res = await fetch(`${getApiBase()}/api/admin/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem>
}

export async function updateAdminProduct(
  token: string,
  id: number,
  fields: ProductFormFields,
  files: File[],
  keepImagePaths: string[] = [],
): Promise<ProductItem> {
  const body = new FormData()
  appendProductFormFields(body, fields)
  if (keepImagePaths.length === 0) {
    body.append('keepImagePaths', '')
  } else {
    for (const path of keepImagePaths) {
      body.append('keepImagePaths', path)
    }
  }
  for (const file of files) {
    body.append('files', file)
  }
  const res = await fetch(`${getApiBase()}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem>
}

export async function setAdminProductActive(
  token: string,
  id: number,
  active: boolean,
): Promise<ProductItem> {
  const res = await fetch(
    `${getApiBase()}/api/admin/products/${id}/active?active=${active}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    },
  )
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductItem>
}

export async function deleteAdminProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type ApiOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type ApiPaymentMethod = 'COD' | 'ESEWA' | 'KHALTI'

export type AdminOrderLine = {
  id?: number
  productId: number
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  sizeLabel?: string
  imagePath: string | null
  cancelled?: boolean
  cancelledAt?: string | null
}

export type AdminOrder = {
  id: number
  orderNumber: string
  customerName: string
  customerEmail: string
  phone: string | null
  address: string
  placedAt: string
  confirmedAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  status: ApiOrderStatus
  paymentMethod: ApiPaymentMethod
  subtotal: number
  taxAmount: number
  total: number
  items: AdminOrderLine[]
}

export async function placeOrder(
  token: string,
  body: { cartLineIds: number[]; paymentMethod: 'COD' },
): Promise<AdminOrder> {
  const res = await fetch(`${getApiBase()}/api/orders/me`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder>
}

export type EsewaInitResponse = {
  orderId: number
}

export async function initEsewaPayment(
  token: string,
  body: { cartLineIds: number[]; paymentMethod: 'ESEWA' },
): Promise<EsewaInitResponse> {
  const res = await fetch(`${getApiBase()}/api/payments/esewa/init`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<EsewaInitResponse>
}

export function esewaLaunchUrl(orderId: number, token: string): string {
  const params = new URLSearchParams({ access_token: token })
  return `${getApiBase()}/api/payments/esewa/launch/${orderId}?${params.toString()}`
}

export type KhaltiInitResponse = {
  paymentUrl: string
  orderId: number
}

export async function initKhaltiPayment(
  token: string,
  body: { cartLineIds: number[]; paymentMethod: 'KHALTI' },
): Promise<KhaltiInitResponse> {
  const res = await fetch(`${getApiBase()}/api/payments/khalti/init`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<KhaltiInitResponse>
}

export async function fetchMyOrders(token: string): Promise<AdminOrder[]> {
  const res = await fetch(`${getApiBase()}/api/orders/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder[]>
}

export async function cancelMyOrderLine(
  token: string,
  orderId: number,
  lineId: number,
): Promise<AdminOrder> {
  const res = await fetch(`${getApiBase()}/api/orders/me/${orderId}/lines/${lineId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder>
}

export async function fetchAdminOrders(token: string): Promise<AdminOrder[]> {
  const res = await fetch(`${getApiBase()}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder[]>
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: number,
  status: Exclude<ApiOrderStatus, 'CANCELLED'>,
): Promise<AdminOrder> {
  const res = await fetch(`${getApiBase()}/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminOrder>
}

export interface ProductReviewItem {
  id: number
  productId: number
  productName: string
  productDetail: string
  productImage: string | null
  userPhoto: string | null
  userName: string
  rating: number
  comment: string
  reviewImages: string[]
  adminReply: string | null
  createdAt: string
  likeCount: number
  likedByCurrentUser: boolean
  likedByGmw: boolean
  ownedByCurrentUser: boolean
}

export interface ReviewEligibility {
  canReview: boolean
  alreadyReviewed: boolean
  hasDeliveredPurchase: boolean
}

export async function fetchProductReviews(
  productId: number,
  token?: string | null,
): Promise<ProductReviewItem[]> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${getApiBase()}/api/products/${productId}/reviews`, { headers })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem[]>
}

export async function fetchReviewEligibility(
  token: string,
  productId: number,
): Promise<ReviewEligibility> {
  const res = await fetch(`${getApiBase()}/api/products/${productId}/reviews/eligibility`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ReviewEligibility>
}

export async function submitProductReview(
  token: string,
  productId: number,
  payload: { rating: number; comment: string; images: File[] },
): Promise<ProductReviewItem> {
  const body = new FormData()
  body.append('rating', String(payload.rating))
  body.append('comment', payload.comment)
  for (const file of payload.images) {
    body.append('images', file)
  }
  const res = await fetch(`${getApiBase()}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem>
}

export async function fetchAdminReviews(token: string): Promise<ProductReviewItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/reviews`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem[]>
}

export async function setAdminReviewReply(
  token: string,
  reviewId: number,
  reply: string,
): Promise<ProductReviewItem> {
  const res = await fetch(`${getApiBase()}/api/admin/reviews/${reviewId}/reply`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ reply }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem>
}

export async function deleteProductReview(token: string, reviewId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function deleteAdminReview(token: string, reviewId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export async function likeReview(reviewId: number, token: string): Promise<ProductReviewItem> {
  const res = await fetch(`${getApiBase()}/api/reviews/${reviewId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem>
}

export async function unlikeReview(reviewId: number, token: string): Promise<ProductReviewItem> {
  const res = await fetch(`${getApiBase()}/api/reviews/${reviewId}/like`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ProductReviewItem>
}

export type ServiceAppointmentStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

export type ServiceAppointmentMode = 'workshop' | 'pickup'

export interface ServiceAppointmentItem {
  id: number
  appointmentNumber: string
  submittedAt: string
  status: ServiceAppointmentStatus
  mode: ServiceAppointmentMode
  customerName: string
  customerEmail: string
  customerPhone: string | null
  serviceIds: string[]
  serviceTitle: string
  date: string
  slot: string
  bikeLabel: string
  notes: string | null
  pickupLat: number | null
  pickupLng: number | null
}

export type CreateWorkshopAppointmentPayload = {
  serviceIds: string[]
  date: string
  timeSlot: string
  vehicleId: number
  notes?: string
}

export type CreatePickupAppointmentPayload = {
  serviceIds: string[]
  date: string
  timeSlot: string
  vehicleId: number
  pickupLat: number
  pickupLng: number
  notes?: string
}

export async function fetchMyAppointments(token: string): Promise<ServiceAppointmentItem[]> {
  const res = await fetch(`${getApiBase()}/api/appointments/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem[]>
}

export async function cancelMyAppointment(token: string, appointmentId: number): Promise<ServiceAppointmentItem> {
  const res = await fetch(`${getApiBase()}/api/appointments/me/${appointmentId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem>
}

export async function createWorkshopAppointment(
  token: string,
  body: CreateWorkshopAppointmentPayload,
): Promise<ServiceAppointmentItem> {
  const res = await fetch(`${getApiBase()}/api/appointments/me/workshop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem>
}

export async function createPickupAppointment(
  token: string,
  body: CreatePickupAppointmentPayload,
): Promise<ServiceAppointmentItem> {
  const res = await fetch(`${getApiBase()}/api/appointments/me/pickup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem>
}

export type AdminDashboardStat = {
  label: string
  value: string
  change: string
}

export type AdminDashboardRecentOrder = {
  id: string
  customer: string
  status: string
}

export type AdminDashboardUpcomingBooking = {
  id: string
  client: string
  slot: string
  service: string
  status: string
}

export type AdminDashboardAvailability = {
  date: string
  day: string
  slots: string[]
}

export type AdminNotificationItem = {
  id: string
  type: 'order' | 'appointment'
  title: string
  message: string
  linkPath: string
  createdAt: string
}

export type AdminNotificationsData = {
  count: number
  notifications: AdminNotificationItem[]
}

export type AdminDashboardData = {
  stats: AdminDashboardStat[]
  monthLabels: string[]
  monthlySales: number[]
  monthlyUsers: number[]
  recentOrders: AdminDashboardRecentOrder[]
  upcomingBookings: AdminDashboardUpcomingBooking[]
  serviceAvailability: AdminDashboardAvailability[]
  notificationCount: number
  notifications: AdminNotificationItem[]
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardData> {
  const res = await fetch(`${getApiBase()}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminDashboardData>
}

export async function fetchAdminNotifications(token: string): Promise<AdminNotificationsData> {
  const res = await fetch(`${getApiBase()}/api/admin/notifications`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminNotificationsData>
}

export type AdminNavBadges = {
  pendingOrders: number
  pendingAppointments: number
  newReviews: number
}

export async function fetchAdminNavBadges(token: string): Promise<AdminNavBadges> {
  const res = await fetch(`${getApiBase()}/api/admin/nav-badges`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminNavBadges>
}

export async function fetchAdminAppointments(token: string): Promise<ServiceAppointmentItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/appointments`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem[]>
}

export async function updateAdminAppointmentStatus(
  token: string,
  appointmentId: number,
  status: Exclude<ServiceAppointmentStatus, 'pending' | 'cancelled'>,
): Promise<ServiceAppointmentItem> {
  const res = await fetch(`${getApiBase()}/api/admin/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status: status.toUpperCase() }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAppointmentItem>
}

export type ServiceAvailabilityDay = {
  date: string
  slots: string[]
}

export async function fetchServiceAvailability(): Promise<ServiceAvailabilityDay[]> {
  const res = await fetch(`${getApiBase()}/api/service-availability`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAvailabilityDay[]>
}

export async function fetchAdminServiceAvailability(token: string): Promise<ServiceAvailabilityDay[]> {
  const res = await fetch(`${getApiBase()}/api/admin/service-availability`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAvailabilityDay[]>
}

export async function upsertAdminServiceAvailability(
  token: string,
  body: { date: string; slots: string[] },
): Promise<ServiceAvailabilityDay> {
  const res = await fetch(`${getApiBase()}/api/admin/service-availability`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<ServiceAvailabilityDay>
}

export async function deleteAdminServiceAvailability(token: string, date: string): Promise<void> {
  const res = await fetch(
    `${getApiBase()}/api/admin/service-availability?date=${encodeURIComponent(date)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    },
  )
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}

export type AdminBillLine = {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export type AdminBillItem = {
  id: number
  invoiceNumber: string
  issuedAt: string
  dueAt: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  customerAddress: string | null
  lines: AdminBillLine[]
  discountPercent: number
  paymentTerms: string
}

export type SaveAdminBillPayload = {
  invoiceNumber: string
  issuedAt: string
  dueAt: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  lines: AdminBillLine[]
  discountPercent: number
  paymentTerms: string
}

export async function fetchAdminBills(token: string): Promise<AdminBillItem[]> {
  const res = await fetch(`${getApiBase()}/api/admin/bills`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminBillItem[]>
}

export async function fetchNextAdminBillNumber(token: string): Promise<string> {
  const res = await fetch(`${getApiBase()}/api/admin/bills/next-number`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/plain, application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.text()
}

export async function createAdminBill(token: string, body: SaveAdminBillPayload): Promise<AdminBillItem> {
  const res = await fetch(`${getApiBase()}/api/admin/bills`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminBillItem>
}

export async function updateAdminBill(
  token: string,
  billId: number,
  body: SaveAdminBillPayload,
): Promise<AdminBillItem> {
  const res = await fetch(`${getApiBase()}/api/admin/bills/${billId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json() as Promise<AdminBillItem>
}

export async function deleteAdminBill(token: string, billId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/bills/${billId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
}
