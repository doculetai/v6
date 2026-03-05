/**
 * Primitives by domain — merged for backward compatibility.
 * Import from "@/config/copy/primitives" (resolves to this index).
 *
 * Domain files:
 * - ui      Shared UI (labels, aria, fileUploader, statusBadge, dialog, etc.)
 * - form    Validation, form fields
 * - feedback  Empty, loading, toast, confirm
 * - data    Pagination, table
 * - common  Actions, nav, dateTime, status, currency
 * - auth    Session management
 * - sponsor Disbursement, earnings, commitment timeline
 * - storybook Demo / Storybook copy
 */

import { uiPrimitives } from "./ui"
import { formPrimitives } from "./form"
import { feedbackPrimitives } from "./feedback"
import { dataPrimitives } from "./data"
import { commonPrimitives } from "./common"
import { authPrimitives } from "./auth"
import { sponsorPrimitives } from "./sponsor"
import { storybookPrimitives } from "./storybook"

export const primitivesCopy = {
  ...uiPrimitives,
  validation: formPrimitives.validation,
  form: formPrimitives.fields,
  ...feedbackPrimitives,
  ...dataPrimitives,
  ...commonPrimitives,
  ...authPrimitives,
  ...sponsorPrimitives,
  storybook: storybookPrimitives,
} as const

export type PrimitivesCopy = typeof primitivesCopy

// Re-export domains for direct imports when needed
export { uiPrimitives } from "./ui"
export { formPrimitives } from "./form"
export { feedbackPrimitives } from "./feedback"
export { dataPrimitives } from "./data"
export { commonPrimitives } from "./common"
export { authPrimitives } from "./auth"
export { sponsorPrimitives } from "./sponsor"
export { storybookPrimitives } from "./storybook"
