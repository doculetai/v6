export const commonErrors = {
  generic: "Unable to complete this action. Please try again.",
  sessionExpired: "Your session has expired. Please sign in again.",
  unauthorized: "You don't have permission to access this page.",
  tryAgain: 'Try again',
} as const;

export const commonUi = {
  close: "Close",
} as const;

export const sharedCopy = {
  fxRate: {
    label: 'NGN / USD',
    sub: 'Last updated exchange rate',
    unavailable: 'Rate unavailable',
    updatedAt: (date: string) => `Updated ${date}`,
    source: (source: string) => `Source: ${source}`,
  },
  fxRateInline: {
    prefix: 'Rate: $1 = ',
    updated: 'Updated',
    stalePrefix: 'Rate may be outdated · Last updated',
  },
} as const;
