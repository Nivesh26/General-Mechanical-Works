import { FiFileText } from 'react-icons/fi'
import { toAbsoluteApiUrl } from '../lib/api'

type ChatMessageAttachmentProps = {
  attachmentUrl: string
  attachmentType: 'IMAGE' | 'PDF'
  attachmentName?: string | null
  onPreviewImage?: (url: string) => void
  maxImageWidth?: number
}

export function resolveChatAttachmentUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('blob:') || url.startsWith('data:')) return url
  return toAbsoluteApiUrl(url) ?? url
}

export default function ChatMessageAttachment({
  attachmentUrl,
  attachmentType,
  attachmentName,
  onPreviewImage,
  maxImageWidth = 220,
}: ChatMessageAttachmentProps) {
  const url = resolveChatAttachmentUrl(attachmentUrl)
  if (!url) return null

  if (attachmentType === 'IMAGE') {
    return (
      <img
        src={url}
        alt={attachmentName ?? 'Image attachment'}
        onClick={() => onPreviewImage?.(url)}
        style={{
          maxWidth: `${maxImageWidth}px`,
          maxHeight: '180px',
          width: '100%',
          objectFit: 'cover',
          borderRadius: '8px',
          display: 'block',
          marginBottom: '8px',
          cursor: onPreviewImage ? 'pointer' : 'default',
        }}
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        marginBottom: '8px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        color: '#334155',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: 600,
        maxWidth: '100%',
      }}
    >
      <FiFileText size={18} aria-hidden />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {attachmentName ?? 'PDF document'}
      </span>
    </a>
  )
}
