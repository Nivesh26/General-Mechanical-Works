/** How often product lists re-shuffle on the storefront (ms). */
export const PRODUCT_SHUFFLE_INTERVAL_MS = 15_000

/** Fisher–Yates shuffle; returns a new array without mutating the input. */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}
