/** Nepal mobile-style: exactly 10 digits (matches signup). */
export const PHONE_DIGIT_LENGTH = 10
export const PHONE_REGEX = /^\d{10}$/

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGIT_LENGTH)
}

export function phoneValidationError(digits: string, required = true): string {
  if (!digits) return required ? 'Phone number is required.' : ''
  if (!PHONE_REGEX.test(digits)) return 'Please enter exactly 10 digits.'
  return ''
}
