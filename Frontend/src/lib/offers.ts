import { toAbsoluteApiUrl } from './api'

export function offerImageUrl(imagePath: string | null | undefined): string | null {
  return toAbsoluteApiUrl(imagePath ?? null)
}
