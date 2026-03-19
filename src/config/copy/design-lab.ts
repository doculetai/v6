/** Copy for src/app/(internal)/design/ — internal design system lab only. */
export const designLabCopy = {
  sections: {
    colors: 'Colors',
    typography: 'Typography',
    borders: 'Borders',
    corners: 'Corners',
    shadows: 'Shadows',
    spacing: 'Spacing',
    iconography: 'Iconography',
    skeletons: 'Skeleton Components',
    navigation: 'Navigation — Sidebar Preview',
    interactivePrimitives: 'Interactive Primitives',
    dataPrimitives: 'Data Primitives',
    displayPrimitives: 'Display Primitives',
    layoutPrimitives: 'Layout Primitives',
    formControls: 'Form Controls',
    financePrimitives: 'Finance Primitives',
    sessionManagement: 'Session Management',
    compositions: 'Composed Surfaces',
  },
  demo: {
    overviewTitle: 'Overview',
    overviewSubtitle: 'Your sponsorship funding at a glance.',
    studentsTitle: 'Students',
    studentsSubtitle: 'Manage student applications and verification status.',
    profileName: 'Kemi Adesanya',
    profileSchool: 'University of Lagos',
    dashboardTitle: 'Student Dashboard',
    dashboardSubtitle: 'Manage your sponsorship applications and documents.',
    metrics: {
      totalFunded: 'Total Funded',
      totalDisbursed: 'Total Disbursed',
      activeStudents: 'Active Students',
      pendingReviews: 'Pending Reviews',
      disbursed: 'Disbursed',
      loadingState: 'Loading state',
      errorState: 'Error state',
    },
    masked: {
      cardNumber: 'Card number',
      phone: 'Phone',
    },
    emptyDocs: {
      heading: 'No documents uploaded yet',
      body: 'Upload your admission letter, school ID, and other required documents to proceed.',
      action: 'Upload your first document',
    },
    emptySponsorships: {
      heading: 'No sponsorships found',
      body: 'You have not received any sponsorship offers. Share your profile to attract sponsors.',
    },
    blockedVerification: {
      heading: 'Verification required',
      body: 'Complete identity verification to access your documents. This takes less than 2 minutes.',
      action: 'Verify identity',
    },
    errorDocs: {
      heading: 'Failed to load documents',
      body: 'There was a problem loading your documents. Please check your connection and try again.',
      action: 'Try again',
    },
    errorPayment: {
      heading: 'Payment failed',
      body: 'Your payment could not be processed. Please update your payment method.',
      primaryAction: 'Update payment',
      secondaryAction: 'Contact support',
    },
    sponsorType: {
      self: {
        title: 'I am paying for my education',
        description: 'Self-funded — covers tuition from personal funds.',
      },
      family: {
        title: 'Someone is sponsoring me',
        description: 'Family sponsor — an individual is funding your studies.',
      },
      corporate: {
        title: 'A company is sponsoring me',
        description: 'Corporate sponsor — your employer or an organisation.',
      },
    },
  },
} as const;
