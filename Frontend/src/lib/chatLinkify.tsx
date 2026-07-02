import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

const LINK_PATTERN =
  /(https?:\/\/[^\s]+|\/(?:productdetail|products|cart|checkout|services|ordertracking|bookings)(?:\/[^\s]*)?)/gi

function trimLinkTrailingPunctuation(url: string): string {
  return url.replace(/[),.;!?]+$/g, '')
}

function internalPath(url: string): string | null {
  const cleaned = trimLinkTrailingPunctuation(url.trim())
  if (!cleaned) return null

  if (cleaned.startsWith('/')) {
    return cleaned
  }

  try {
    const parsed = new URL(cleaned)
    if (typeof window === 'undefined') {
      return parsed.pathname + parsed.search
    }
    if (parsed.origin === window.location.origin) {
      return parsed.pathname + parsed.search
    }
  } catch {
    return null
  }

  return null
}

function ChatTextLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: string
}) {
  const path = internalPath(href)
  const label = trimLinkTrailingPunctuation(children)

  if (path) {
    return (
      <Link to={path} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a href={trimLinkTrailingPunctuation(href)} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  )
}

export function linkifyChatText(text: string, linkClassName: string): ReactNode[] {
  const parts = text.split(LINK_PATTERN)
  return parts.map((part, index) => {
    if (!part) return null
    LINK_PATTERN.lastIndex = 0
    if (LINK_PATTERN.test(part)) {
      return (
        <ChatTextLink key={`link-${index}`} href={part} className={linkClassName}>
          {part}
        </ChatTextLink>
      )
    }
    return <span key={`text-${index}`}>{part}</span>
  })
}
