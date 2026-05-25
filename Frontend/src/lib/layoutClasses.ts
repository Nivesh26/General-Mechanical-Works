/** Horizontal page gutter for user-facing pages */
export const PAGE_GUTTER = 'px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[80px]'

/** Outer wrapper for every admin page — prevents body-level horizontal scroll */
export const ADMIN_PAGE_ROOT_CLASS =
  'admin-page-root min-h-screen max-w-[100vw] overflow-x-hidden bg-[#f8fafc]'

/** Sidebar width (px) — keep in sync with AdminNavbar and index.css `.admin-main-scroll` */
export const ADMIN_SIDEBAR_WIDTH_PX = 280
/** Gap between fixed sidebar and main content on lg+ */
export const ADMIN_SIDEBAR_GAP_PX = 24
/** Top gap for main content on lg+ (sidebar is full-height; main gets breathing room) */
export const ADMIN_MAIN_TOP_GAP_PX = 16

/** Admin main — left offset for sidebar+gap is in index.css (avoids Tailwind dynamic-class purge) */
export const ADMIN_MAIN_SCROLL_CLASS =
  'admin-main-scroll min-w-0 w-full max-w-full box-border pt-14 lg:pt-0 pr-3 sm:pr-4 lg:pr-6 pb-8 min-h-screen max-h-screen overflow-y-auto overflow-x-hidden'

export const ADMIN_MAIN_MESSAGES_CLASS =
  'admin-main-scroll admin-main-messages min-w-0 w-full max-w-full box-border pt-14 lg:pt-0 pr-3 sm:pr-4 lg:pr-6 h-screen max-h-screen overflow-hidden flex flex-col'

/** Wrap wide admin tables — scroll inside card, not the whole page */
export const ADMIN_TABLE_WRAP = 'admin-table-wrap w-full max-w-full min-w-0 overflow-x-auto'

/** Page sections / cards inside admin main */
export const ADMIN_CONTENT_MAX = 'w-full max-w-full min-w-0'
