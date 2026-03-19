import {
  ArrowRight,
  ArrowSquareOut,
  Pulse,
  ArrowsClockwise,
  Bank,
  Bell,
  BookOpen,
  Buildings,
  CaretDown,
  CaretRight,
  ChartBar,
  ChatCircle,
  CheckCircle,
  Clock,
  ClockCounterClockwise,
  Coins,
  CreditCard,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  FileArrowUp,
  FileText,
  Fingerprint,
  Funnel,
  Gear,
  GraduationCap,
  HandCoins,
  House,
  Info,
  Key,
  Lightning,
  List,
  Lock,
  MagnifyingGlass,
  MapPin,
  Medal,
  Moon,
  DotsThree,
  Palette,
  PaperPlaneTilt,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  ShieldWarning,
  SignOut,
  SquaresFour,
  Star,
  Sun,
  TrendUp,
  Trophy,
  UploadSimple,
  User,
  Users,
  Wallet,
  Warning,
  X,
  XCircle,
} from '@phosphor-icons/react';

export const iconography = {
  // Navigation
  nav: {
    home: House,
    menu: List,
    close: X,
    more: DotsThree,
    external: ArrowSquareOut,
    arrowRight: ArrowRight,
    chevronDown: CaretDown,
    chevronRight: CaretRight,
  },

  // Status & Verification
  status: {
    verified: CheckCircle,
    pending: Clock,
    failed: XCircle,
    warning: Warning,
    info: Info,
    active: CheckCircle,
    locked: Lock,
  },

  // Financial
  finance: {
    wallet: Wallet,
    disbursement: HandCoins,
    transaction: CreditCard,
    institution: Bank,
    earnings: Coins,
    chart: ChartBar,
    trending: TrendUp,
  },

  // Compliance & Security
  compliance: {
    shieldVerified: ShieldCheck,
    shieldRisk: ShieldWarning,
    shield: Shield,
    fingerprint: Fingerprint,
    key: Key,
    lock: Lock,
  },

  // Documents & Files
  documents: {
    fileText: FileText,
    fileCheck: FileText,
    fileUp: FileArrowUp,
    download: DownloadSimple,
    upload: UploadSimple,
    history: ClockCounterClockwise,
  },

  // Education & Certificates
  education: {
    school: GraduationCap,
    university: Buildings,
    certificate: Trophy,
    book: BookOpen,
    star: Star,
    medal: Medal,
  },

  // People & Identity
  people: {
    user: User,
    users: Users,
    mail: EnvelopeSimple,
    phone: Phone,
    location: MapPin,
  },

  // Workflow & Actions
  workflow: {
    kanban: SquaresFour,
    activity: Pulse,
    refresh: ArrowsClockwise,
    filter: Funnel,
    search: MagnifyingGlass,
    plus: Plus,
    send: PaperPlaneTilt,
    eye: Eye,
    message: ChatCircle,
    zap: Lightning,
  },

  // System & Settings
  system: {
    settings: Gear,
    bell: Bell,
    logout: SignOut,
    moon: Moon,
    sun: Sun,
    palette: Palette,
  },
} as const;

// Icon size constants — use these everywhere, never hardcode
export const ICON_SIZES = {
  nav: 'size-6',
  inline: 'size-5',
  small: 'size-4',
  hero: 'size-8',
  display: 'size-12',
} as const;
