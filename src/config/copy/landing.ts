import { routes } from '@/config/routes';

export const landingCopy = {
  meta: {
    title: 'Doculet.ai — Nigerian Bank Statements, Trusted by US Universities',
    description:
      'Doculet verifies Nigerian bank statements via PDF upload or live bank connection and stamps them with a cryptographic seal that US admissions offices can authenticate instantly.',
  },

  nav: {
    brandName: 'Doculet',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'The Seal', href: '#the-seal' },
      { label: 'Pricing', href: routes.marketing.pricing },
    ],
    signIn: 'Sign in',
    cta: 'Get your certificate',
    skipToContent: 'Skip to content',
    ariaLabel: 'Navigation menu',
  },

  hero: {
    eyebrow: 'For Nigerian students applying to US universities',
    headline: 'Verified.',
    sub: 'Your Nigerian bank statement, certified for US university admission.',
    ctaPrimary: 'Get your certificate',
    ctaSecondary: 'How it works',
    ctaSecondaryHref: '#how-it-works',
    stats: [
      { value: '₦ 4.2B', label: 'verified' },
      { value: '12,000+', label: 'students' },
      { value: '340+', label: 'universities' },
    ],
    quote:
      'Certificate issued quickly. My I-20 was processed the same week.',
    quoteAttribution: 'Amara O. — MSc CS, University of Minnesota',
    quoteInitials: 'AO',
  },

  certificate: {
    badge: 'Proof of Funds',
    brand: 'Doculet.ai',
    holderLabel: 'Student',
    holder: 'Amara Okonkwo',
    balanceLabel: 'Verified balance',
    balance: '₦ 22,500,000',
    institutionLabel: 'Institution',
    institution: 'Univ. of Minnesota',
    serialLabel: 'Certificate ID',
    serial: 'DCL-2026-88441',
    status: 'VERIFIED',
    fullTitle: 'Official Certificate',
    fullSubtitle: 'Proof of Funds Verification',
    fullBodyText:
      'This certifies that the named student holds verified funds sufficient to cover tuition and living expenses as required by the admitting US institution.',
    fullFields: [
      { label: 'Student Name', value: 'Amara Okonkwo', mono: false },
      { label: 'Verified Balance', value: '₦ 22,500,000', mono: true },
      { label: 'Institution', value: 'University of Minnesota', mono: false },
      { label: 'Program', value: 'MSc Computer Science', mono: false },
      { label: 'Valid From', value: '01 Mar 2026', mono: true },
      { label: 'Expires', value: '31 Aug 2026', mono: true },
    ],
    fullSerial: 'DCL-2026-88441-AF',
    fullVerifyUrl: 'Verify at doculet.ai/verify',
    fullStatus: 'Cryptographically verified',
    fullIssued: 'Issued 05 Mar 2026',
  },

  problem: {
    label: 'The problem',
    headline: 'Bank statements alone',
    headlineAccent: 'are not enough.',
    body: 'Every year, thousands of Nigerian students lose their US university spots — not because the money is not there, but because any bank statement PDF can be forged in minutes. Admissions offices know this, and many have stopped trusting paper entirely.',
    cards: [
      {
        stat: '10 min',
        title: 'Any PDF can be forged',
        detail:
          'Adobe Acrobat. Screenshot editors. Free online tools. A Nigerian bank statement can be convincingly altered faster than you can print it.',
      },
      {
        stat: '0 calls',
        title: 'No way to verify remotely',
        detail:
          'No US admissions officer can phone GTBank in Lagos to confirm a balance. The verification gap is geographic and systemic.',
      },
      {
        stat: 'I-20 void',
        title: 'Rejection ends the offer',
        detail:
          'Once financial clearance fails, the I-20 is rescinded. Most students never recover their place. The cost is not just money — it is years.',
      },
    ],
  },

  steps: {
    label: 'Process',
    headline: 'From bank statement to verified certificate',
    items: [
      {
        number: '01',
        title: 'KYC — Verify your identity',
        body: 'BVN or NIN match. Instant for most students. If a second layer is needed, your international passport closes it.',
      },
      {
        number: '02',
        title: 'Bank verification',
        body: 'Upload a PDF statement or connect live via Mono. We read your balance — never your password. All major Nigerian banks supported.',
      },
      {
        number: '03',
        title: 'Sponsor and document review',
        body: 'Invite a parent, guardian, or corporate sponsor. They verify identity and commit funds. Our admin team reviews for fraud signals.',
      },
      {
        number: '04',
        title: 'Doculet Seal — Certificate issued',
        body: 'Your certificate is cryptographically sealed. Share one link. Any admissions office verifies in one click — no account required.',
      },
    ],
  },

  trust: {
    label: 'The certificate',
    headline: 'The proof US admissions accept',
    body: 'The exact financial documentation your US university needs to issue your I-20.',
    features: [
      'Accepted by US university admissions offices',
      'Verified via licensed Nigerian bank APIs',
      'Covers tuition and all living costs',
      'Cryptographically signed — tamper-proof',
      'NDPR-compliant document storage',
    ],
    cta: 'Get your certificate',
  },

  faq: {
    headline: 'Questions answered.',
    categories: [
      {
        state: 'Default',
        questions: [
          { q: 'What is the Doculet Seal?', a: 'A cryptographic signature proving your bank balance is real. Any admissions office confirms it in one click — no account needed.' },
          { q: 'Which banks do you support?', a: 'GTBank, Zenith, Access, First Bank, UBA, Stanbic IBTC, Fidelity, FCMB, Sterling — via Mono.' },
        ],
      },
      {
        state: 'Happy path',
        questions: [
          { q: 'How fast is verification?', a: 'Identity check: instant. Bank (live connection): minutes. Full package with sponsor: depends on admin review.' },
          { q: 'Does my university need a Doculet account?', a: 'No. They click the link you send. The verification page is public.' },
        ],
      },
      {
        state: 'Anxiety peaks',
        questions: [
          { q: 'Will my full bank account be exposed?', a: 'Only your verified balance appears on the certificate. No account number, no transaction history.' },
          { q: 'What if my funds are not enough on their own?', a: 'Add sponsors. Multiple family members or a company can commit funds to reach your target.' },
        ],
      },
      {
        state: 'Decision points',
        questions: [
          { q: 'PDF upload or live bank connection?', a: 'PDF works for any bank. Live Mono connection is faster and produces a stronger verification signal.' },
          { q: 'Do I need a sponsor?', a: 'Not for Tier 1 or Tier 2. Tier 3 (higher amounts, stricter schools) may require sponsor verification.' },
        ],
      },
      {
        state: 'Blocked',
        questions: [
          { q: 'My identity check failed — what next?', a: 'A review option appears on your dashboard. Submit your international passport for manual review.' },
          { q: 'My bank statement was rejected?', a: 'The reviewer notes the reason on your dashboard. Correct and resubmit — no need to restart.' },
        ],
      },
      {
        state: 'Parallel flow',
        questions: [
          { q: 'Can I apply to multiple universities?', a: 'Yes. Each application is isolated. One shared identity check, separate documents and sponsors per school.' },
          { q: 'Can multiple people sponsor me?', a: 'Yes. Add as many sponsors as you need. Their balances combine toward your proof of funds target.' },
        ],
      },
    ],
  },

  cta: {
    headline: 'Get verified before your I-20 deadline',
    body: 'Create your account and submit your proof of funds today.',
    ctaPrimary: 'Create your account',
    ctaSecondary: 'Sign in',
  },

  preview: {
    nav: {
      certificateLink: 'Certificate',
      cta: 'Apply now',
    },
    hero: {
      ctaPrimary: 'Start your application',
      ctaSecondary: 'See how it works',
      eyebrow: 'For Nigerian students applying to US universities',
      headline: 'Verified.',
      sub: 'Your Nigerian bank statement,\ncertified for US university admission.',
      quote: '\u201cCertificate issued in 30 hours. My I-20 was processed the same week.\u201d',
      quoteAttribution: '\u2014 Amara, MSc CS, University of Minnesota',
      quoteInitials: 'AO',
      finalQuote: '\u201cCertificate issued in under 30 hours. Our admissions office accepted it the same week.\u201d',
      finalQuoteAttribution: 'Amara Okonkwo, MSc Computer Science',
    },
    steps: {
      sectionLabel: 'Process',
      headline: 'From bank statement\nto verified certificate',
      items: [
        { num: '01', title: 'Create your profile', body: 'Register with your email. Under 3 minutes.' },
        { num: '02', title: 'Upload your bank statement', body: 'PDF or image \u2014 any Nigerian bank. We verify balance and account ownership.' },
        { num: '03', title: 'Connect your sponsor (if applicable)', body: 'If someone is funding your education, invite them to confirm via their own dashboard.' },
        { num: '04', title: 'Receive your certificate', body: 'A tamper-proof proof of funds document \u2014 the financial evidence US universities require for your I-20.' },
      ],
    },
    certificate: {
      sectionLabel: 'The certificate',
      headline: 'The financial proof\nUS admissions accept',
      body: 'Your certificate shows verified account balance, ownership, and funds availability \u2014 exactly what a US university financial office needs to process your I-20.',
      features: [
        'Accepted as proof of funds by US universities',
        'Bank statement verification in 24\u201348 hours',
        'Covers tuition, living costs, and all fees',
        'Cryptographically signed \u2014 tamper-evident',
        'Secure document storage, 7-year retention',
        'NDPR-compliant data handling',
      ],
      cta: 'Get your certificate',
    },
    footer: {
      trustMarkers: ['256-bit encryption', 'NDPR compliant', '7-year document retention', 'Cryptographically signed'],
      copyright: '\u00a9 2026 Doculet.ai',
      links: [
        { label: 'Privacy policy', href: routes.marketing.privacy },
        { label: 'Terms of service', href: routes.marketing.terms },
        { label: 'Contact', href: routes.marketing.contact },
      ],
    },
  },

  footer: {
    trustMarkers: [
      '256-bit encrypted',
      'NDPR compliant',
      'No passwords stored',
      'CAC registered',
    ],
    copyright: '© 2026 Doculet.ai',
    links: [
      { label: 'Privacy', href: routes.marketing.privacy },
      { label: 'Terms', href: routes.marketing.terms },
      { label: 'Contact', href: routes.marketing.contact },
    ],
  },
} as const;
