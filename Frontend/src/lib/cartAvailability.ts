export type CartItemIssue = 'inactive' | 'out_of_stock' | 'insufficient_stock'

export type CartAvailabilityInput = {
  active: boolean
  stock: number
  quantity: number
}

export function getCartItemIssue(item: CartAvailabilityInput): CartItemIssue | null {
  if (!item.active) return 'inactive'
  if (item.stock <= 0) return 'out_of_stock'
  if (item.quantity > item.stock) return 'insufficient_stock'
  return null
}

export function isCartItemCheckoutBlocked(item: CartAvailabilityInput): boolean {
  return getCartItemIssue(item) !== null
}

export function getCartItemIssueLabel(issue: CartItemIssue, stock = 0): string {
  switch (issue) {
    case 'inactive':
      return 'No longer available'
    case 'out_of_stock':
      return 'Out of stock'
    case 'insufficient_stock':
      return `Only ${stock} left in stock`
    default:
      return ''
  }
}
