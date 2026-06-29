const MAX_IMAGE_DIMENSION = 1600
const JPEG_QUALITY = 0.82
const SKIP_COMPRESS_BELOW_BYTES = 350_000

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress image'))),
      type,
      quality,
    )
  })
}

/** Resize/compress chat images before upload so sends feel instant. PDFs pass through unchanged. */
export async function prepareChatUploadFile(file: File): Promise<File> {
  if (isPdfFile(file) || !file.type.startsWith('image/')) return file
  if (file.size <= SKIP_COMPRESS_BELOW_BYTES && file.type === 'image/jpeg') return file

  try {
    const img = await loadImageFromFile(file)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await canvasToBlob(canvas, outputType, JPEG_QUALITY)
    if (blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    const ext = outputType === 'image/png' ? '.png' : '.jpg'
    return new File([blob], `${baseName}${ext}`, { type: outputType, lastModified: Date.now() })
  } catch {
    return file
  }
}
