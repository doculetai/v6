import { routes } from '@/config/routes';

export const landingCopy = {
  meta: {
    title: 'Doculet.ai — Nigerian Bank Statements, Trusted by US Universities',
    description:
      'Doculet verifies Nigerian bank statements via PDF upload or live bank connection and stamps them with a cryptographic seal that US admissions offices can authenticate instantly.',
  },

  nav: {
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'The Seal', href: '#the-seal' },
      { label: 'Pricing', href: routes.marketing.pricing },
    ],
    signIn: 'Sign in',
    cta: 'Get your certificate',
  },

  hero: {
    eyebrow: 'For Nigerian students applying to US universities',
    headline: 'Verified.',
    sub: 'Your Nigerian bank statement, certified for US university admission.',
    ctaPrimary: 'Get your certificate',
    ctaSecondary: 'How it works',
    ctaSecondaryHref: '#how-it-works',
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
    headline: 'The financial proof US admissions accept',
    body: 'Your certificate shows verified account balance, ownership, and funds availability — exactly what a US university financial office needs to process your I-20.',
    features: [
      'Accepted as proof of funds by US universities',
      'Bank statement verification via licensed API',
      'Covers tuition, living costs, and all fees',
      'Cryptographically signed — tamper-evident',
      'Secure document storage, NDPR compliant',
    ],
    cta: 'Get your certificate',
  },

  faq: {
    headline: 'Questions answered.',
    items: [
      {
        question: 'What exactly is the Doculet Seal?',
        answer:
          'The Doculet Seal is a cryptographic signature applied to your certificate after we verify your identity, bank balance, and (for Tier 3) your sponsors. It cannot be transferred to another document. Any admissions office can verify the seal is intact using the link we provide — no account required.',
      },
      {
        question: 'Which Nigerian banks do you support?',
        answer:
          'All major banks at launch: GTBank, Access Bank, Zenith Bank, First Bank, UBA, Stanbic IBTC, Fidelity, FCMB, and Sterling. Connected via Mono — licensed open banking APIs, not screen-scraping.',
      },
      {
        question: 'How long does verification take?',
        answer:
          'Tier 1 (identity only) is usually instant. Tier 2 (identity + bank) takes a short time for live connection, or longer for PDF upload. Tier 3 (+ sponsor + admin review) takes additional time for our team to review. Most students complete the full process in under a week.',
      },
      {
        question: 'Can I upload a PDF or do I need to connect my bank?',
        answer:
          'Both paths are available. PDF upload works for all banks. Live API connection via Mono gives you a faster, stronger verification signal and is available for all major Nigerian banks. You choose the path that works for you.',
      },
      {
        question: 'Does the admissions office need a Doculet account?',
        answer:
          'No. University admissions staff verify certificates by opening the link you send them. The verification page is public, no login required. They see the seal status, the verified balance, the issuing bank, and the expiry date.',
      },
    ],
  },

  cta: {
    headline: 'Your US university needs this document',
    body: 'Start today. Get your Doculet certificate before your I-20 deadline.',
    ctaPrimary: 'Create your account',
    ctaSecondary: 'Sign in',
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
