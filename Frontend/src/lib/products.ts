import { toAbsoluteApiUrl, type ProductItem } from './api'

export function productImageUrl(path: string | null | undefined): string | null {
  return toAbsoluteApiUrl(path ?? null)
}

export function mapProductImages(item: ProductItem): string[] {
  return (item.imagePaths ?? [])
    .map((p) => productImageUrl(p))
    .filter((url): url is string => Boolean(url))
}
