export type ProductEnquiryRequest = {
  productId: number
  name: string
  sku: string
  category: string
  price: number
  selectedSize: string | null
  imageUrl: string | null
}

const formatPrice = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`

export function buildProductEnquiryMessage(request: ProductEnquiryRequest): string {
  const lines = [
    'Hello,',
    '',
    'I would like to enquire about the product shown above.',
    '',
    `Product: ${request.name}`,
    `SKU: ${request.sku}`,
    `Category: ${request.category}`,
    `Price: ${formatPrice(request.price)}`,
  ]

  if (request.selectedSize) {
    lines.push(`Size: ${request.selectedSize}`)
  }

  lines.push(
    '',
    'Could you please confirm availability and share any additional details?',
    '',
    'Thank you.',
  )

  return lines.join('\n')
}

export async function fetchProductImageAsFile(
  imageUrl: string,
  productName: string,
): Promise<File | null> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return null
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    const safeName =
      productName
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 48) || 'product-enquiry'
    return new File([blob], `${safeName}.${ext}`, { type: blob.type, lastModified: Date.now() })
  } catch {
    return null
  }
}
