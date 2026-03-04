/** V6 test landing page copy — editorial fintech voice, Nigerian founder warmth */
export const landingCopy = {
  nav: {
    brand: "Doculet.ai",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Universities", href: "#universities" },
      { label: "Pricing", href: "#pricing" },
    ],
    signIn: "Sign in",
    cta: "Get started",
  },

  hero: {
    eyebrow: "Trusted by US admissions offices",
    headline: "Your Nigerian bank statement,",
    headlineAccent: "trusted by US universities.",
    subtitle:
      "Doculet verifies your bank balance — via PDF upload or live bank connection — and stamps it with a cryptographic seal that US admissions offices can authenticate in one click.",
    ctaPrimary: "Get your certificate",
    ctaSecondary: "Verify a certificate",
    helper: "No passwords stored. NDPR compliant.",
  },

  /** Certificate preview — rendered as a visual mockup in the hero */
  certificate: {
    badge: "Doculet Seal — Verified",
    title: "Proof of Funds Certificate",
    serial: "DOC-2026-7B3A-1E9C",
    holder: "Kemi Adesanya",
    institution: "University of Michigan",
    amount: "₦22,500,000",
    amountLabel: "Verified Balance",
    issued: "4 Mar 2026",
    expires: "11 Mar 2026",
    source: "Guaranty Trust Bank",
    tier: "Tier 3 — Identity + Bank + Sponsor",
    status: "Cryptographically Sealed",
  },

  problem: {
    headline: "Bank statements alone",
    headlineAccent: "are not enough.",
    body: "Every year, thousands of Nigerian students lose their US university spots — not because the money is not there, but because any bank statement PDF can be forged in minutes. Admissions offices know this, and many have stopped trusting paper entirely.",
    cards: [
      {
        title: "Any PDF can be forged",
        stat: "10 min",
        detail:
          "Adobe Acrobat. Screenshot editors. Free online tools. A Nigerian bank statement can be convincingly altered faster than you can print it.",
      },
      {
        title: "No way to verify remotely",
        stat: "0 calls",
        detail:
          "No US admissions officer can phone GTBank in Lagos to confirm a balance. The verification gap is geographic and systemic — not a failure of effort.",
      },
      {
        title: "Rejection kills the offer",
        stat: "I-20 void",
        detail:
          "Once financial clearance fails, the I-20 is rescinded. Most students never recover their place. The cost is not just money — it is years.",
      },
    ],
  },

  steps: {
    eyebrow: "How it works",
    headline: "Four steps to",
    headlineAccent: "a trusted certificate.",
    items: [
      {
        number: "01",
        title: "KYC — Verify your identity",
        description:
          "BVN or NIN match. Instant for most students. If we need a second layer, your international passport closes it.",
      },
      {
        number: "02",
        title: "Bank verification",
        description:
          "Upload a PDF statement or connect live via Mono. We read your balance — never your password. GTBank, Access, Zenith, First Bank, UBA all supported.",
      },
      {
        number: "03",
        title: "Sponsor and document review",
        description:
          "Invite a parent, guardian, or corporate sponsor. They verify identity and commit funds. Our admin team reviews for fraud signals.",
      },
      {
        number: "04",
        title: "Doculet Seal — Certificate issued",
        description:
          "Your certificate is cryptographically sealed. Share one link. Any admissions office verifies in one click — no login, no account required.",
      },
    ],
  },

  universities: {
    eyebrow: "For US admissions offices",
    headline: "Stop chasing students",
    headlineAccent: "for better scans.",
    subtitle:
      "Doculet certificates are issued only after identity verification, live bank confirmation, and admin fraud review. One link. Instant verification. No phone calls to Lagos.",
    features: [
      {
        title: "Tamper-evident seal",
        detail:
          "Every certificate is cryptographically signed. Any alteration — even a single character — breaks the seal and shows as invalid.",
      },
      {
        title: "Real bank data, not PDFs",
        detail:
          "Balances are confirmed against live bank records via licensed API. Not scans. Not screenshots. Actual account data at time of verification.",
      },
      {
        title: "Time-bounded validity",
        detail:
          "You set the expiry window — 24 hours to 30 days. No stale certificates floating around six months after issuance.",
      },
      {
        title: "Multi-source verification",
        detail:
          "Tier 3 certificates include identity, primary bank, sponsor bank, and admin review. Each layer is independently verified and logged.",
      },
    ],
    cta: "Request university access",
    ctaNote: "Free for admissions offices. API available.",
  },

  security: {
    headline: "The Doculet Seal.",
    subtitle:
      "A bank statement without the seal is a PDF. A bank statement with the seal is proof. Here is what the seal guarantees.",
    items: [
      {
        label: "Identity verified",
        detail:
          "BVN or NIN match confirmed against NIMC records. The person named on the certificate is the person who applied.",
      },
      {
        label: "Balance confirmed at source",
        detail:
          "Balance pulled directly from the bank via read-only API at time of issuance. Not a screenshot, not a PDF — a live record.",
      },
      {
        label: "Fraud signals reviewed",
        detail:
          "Our admin team checks every Tier 2 and Tier 3 application against known fraud patterns before the seal is applied.",
      },
      {
        label: "Cryptographically tamper-evident",
        detail:
          "The certificate hash is computed at signing. Any modification — including whitespace — breaks the seal and triggers invalid status.",
      },
    ],
    regulatory: "Registered with CAC Nigeria (RC-2847193)",
  },

  faq: {
    headline: "Questions answered.",
    items: [
      {
        question: "What exactly is the Doculet Seal?",
        answer:
          "The Doculet Seal is a cryptographic signature applied to your certificate after we verify your identity, bank balance, and (for Tier 3) your sponsors. It cannot be transferred to another document. Any admissions office can verify the seal is intact using the link we provide — no account required.",
      },
      {
        question: "Which Nigerian banks do you support?",
        answer:
          "All major banks at launch: GTBank, Access Bank, Zenith Bank, First Bank, UBA, Stanbic IBTC, Fidelity, FCMB, and Sterling. Connected via Mono — licensed open banking APIs, not screen-scraping.",
      },
      {
        question: "How long does verification take?",
        answer:
          "Tier 1 (identity only) is usually instant. Tier 2 (identity + bank) takes a few minutes for live connection, or up to 24 hours for PDF upload. Tier 3 (+ sponsor + admin review) takes 2–5 business days. Most students complete the full process in under a week.",
      },
      {
        question: "Can I upload a PDF or do I need to connect my bank?",
        answer:
          "Both paths are available. PDF upload works for all banks. Live API connection via Mono gives you a faster, stronger verification signal and is available for all major Nigerian banks. You choose the path that works for you.",
      },
      {
        question: "Does the admissions office need a Doculet account?",
        answer:
          "No. University admissions staff verify certificates by opening the link you send them. The verification page is public, no login required. They see the seal status, the verified balance, the issuing bank, and the expiry date.",
      },
    ],
  },

  cta: {
    headline: "Start your verification today.",
    subtitle:
      "Get your Doculet certificate before your I-20 deadline. Most students complete Tier 2 in under 24 hours.",
    ctaPrimary: "Get your certificate",
    ctaSecondary: "Verify a certificate",
  },

  trustShield: {
    title: "Doculet Seal — Verified",
    subtitle: "Cryptographically signed proof of funds",
    stats: [
      { label: "Verification tiers", value: "Tier 1–3" },
      { label: "Encryption", value: "AES-256" },
      { label: "Audit trail", value: "Immutable" },
      { label: "Data residency", value: "Nigeria" },
    ],
  },

  trustMarkers: [
    "256-bit encrypted",
    "NDPR compliant",
    "No passwords stored",
    "CAC registered",
  ],

  footer: {
    copyright: "Doculet Technologies Ltd.",
    address: "Victoria Island, Lagos, Nigeria",
    regulatory: "NDPR compliant. RC-2847193.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;
