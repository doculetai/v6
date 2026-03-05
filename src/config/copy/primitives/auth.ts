/** Auth / account / session primitives */

export const authPrimitives = {
  sessionManagement: {
    thisDevice: "This device",
    activeSession: "Active session",
    revokeSession: "Revoke session",
    revoke: "Revoke",
    noOtherSessions: "No other active sessions. You are signed in on this device only.",
    lastActive: "Last active",
    title: "Active Sessions",
    description: "Devices and browsers currently signed in to your account.",
    signOutAllOthers: "Sign out of all other sessions",
    browsers: {
      Chrome: "Google Chrome",
      Safari: "Safari",
      Firefox: "Mozilla Firefox",
      Edge: "Microsoft Edge",
      Opera: "Opera",
      Unknown: "Unknown browser",
    },
    devices: {
      desktop: "Desktop",
      mobile: "Mobile device",
      tablet: "Tablet",
      unknown: "Unknown device",
    },
  },
} as const
