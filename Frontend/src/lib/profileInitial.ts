/** First letter of a person's name for avatar placeholders (uppercase). */
export function profileInitialFromName(fullName: string): string {
  const t = fullName.trim()
  if (!t) return 'U'
  return t.charAt(0).toUpperCase()
}
