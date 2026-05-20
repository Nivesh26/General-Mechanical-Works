import { toAbsoluteApiUrl } from './api'

export function blogImageUrl(imagePath: string | null | undefined): string | null {
  return toAbsoluteApiUrl(imagePath ?? null)
}

/** Split stored body into paragraphs (blank line or single newlines). */
export function blogBodyToParagraphs(body: string): string[] {
  const trimmed = body.trim()
  if (!trimmed) return []
  const byParagraph = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (byParagraph.length > 1) return byParagraph
  return trimmed.split('\n').map((p) => p.trim()).filter(Boolean)
}
