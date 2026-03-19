// ── Sidebar layout constants — canonical source of truth ─────────────────────
// Any component that needs sidebar dimensions imports from here.
// CSS custom properties (--sidebar-width etc.) are set in globals.css using
// these same values so JavaScript layout and CSS stay in sync.

export const SIDEBAR_WIDTH_EXPANDED  = 240; // px
export const SIDEBAR_WIDTH_COLLAPSED = 64;  // px
export const SIDEBAR_HEADER_HEIGHT   = 56;  // px — matches topbar h-14
export const NAV_ITEM_HEIGHT         = 44;  // px — WCAG minimum touch target
