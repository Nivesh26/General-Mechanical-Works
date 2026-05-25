import type { CSSProperties } from 'react'

export {
  ADMIN_PAGE_ROOT_CLASS,
  ADMIN_MAIN_SCROLL_CLASS,
  ADMIN_MAIN_MESSAGES_CLASS,
  ADMIN_TABLE_WRAP,
  ADMIN_CONTENT_MAX,
} from '../lib/layoutClasses'

/** @deprecated Use ADMIN_MAIN_SCROLL_CLASS with className */
export const ADMIN_MAIN_SCROLL: CSSProperties = {
  marginLeft: '280px',
  padding: '24px 24px 32px',
  minHeight: '100vh',
  maxHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
}

/** @deprecated Use ADMIN_MAIN_MESSAGES_CLASS with className */
export const ADMIN_MAIN_MESSAGES: CSSProperties = {
  marginLeft: '280px',
  padding: '24px',
  height: '100vh',
  maxHeight: '100vh',
  boxSizing: 'border-box',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}

/** Primary page title — same size, weight, and color on every admin page */
export const ADMIN_PAGE_TITLE: CSSProperties = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 700,
  color: '#1e293b',
}

/** Subtitle directly under the admin page title */
export const ADMIN_PAGE_SUBTITLE: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '14px',
  color: '#64748b',
}

/** Space below the heading block (title ± subtitle) before main content */
export const ADMIN_PAGE_HEADER_SPACING: CSSProperties = {
  marginBottom: '16px',
}

/** Responsive admin page title (prefer over inline ADMIN_PAGE_TITLE on new code) */
export const ADMIN_PAGE_TITLE_CLASS =
  'm-0 text-xl sm:text-2xl font-bold text-slate-800'

export const ADMIN_PAGE_SUBTITLE_CLASS = 'mt-1.5 text-sm text-slate-500'

export const ADMIN_PAGE_HEADER_ROW_CLASS =
  'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'
