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
