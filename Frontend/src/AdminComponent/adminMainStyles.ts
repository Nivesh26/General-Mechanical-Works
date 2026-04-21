import type { CSSProperties } from 'react'

/** Standard admin content area: scrolls when tall; keeps sidebar full height. */
export const ADMIN_MAIN_SCROLL: CSSProperties = {
  marginLeft: '280px',
  padding: '24px 24px 32px',
  minHeight: '100vh',
  maxHeight: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
}

/** Messages page: full viewport height, no outer scroll; inner panels scroll. */
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
