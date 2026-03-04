import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Coins,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  FileUp,
  Filter,
  Fingerprint,
  GraduationCap,
  HandCoins,
  History,
  Home,
  KanbanSquare,
  Key,
  Landmark,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

export const iconography = {
  // Navigation
  nav: {
    home: Home,
    menu: Menu,
    close: X,
    more: MoreHorizontal,
    external: ExternalLink,
    arrowRight: ArrowRight,
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
  },

  // Status & Verification
  status: {
    verified: CheckCircle2,
    pending: Clock3,
    failed: XCircle,
    warning: AlertTriangle,
    info: AlertCircle,
    active: CircleCheckBig,
    locked: Lock,
  },

  // Financial
  finance: {
    wallet: Wallet,
    disbursement: HandCoins,
    transaction: CreditCard,
    institution: Landmark,
    earnings: Coins,
    chart: BarChart3,
    trending: TrendingUp,
  },

  // Compliance & Security
  compliance: {
    shieldVerified: ShieldCheck,
    shieldRisk: ShieldAlert,
    shield: Shield,
    fingerprint: Fingerprint,
    key: Key,
    lock: Lock,
  },

  // Documents & Files
  documents: {
    fileText: FileText,
    fileCheck: FileCheck2,
    fileUp: FileUp,
    download: Download,
    upload: Upload,
    history: History,
  },

  // Education & Certificates
  education: {
    school: GraduationCap,
    university: Building2,
    certificate: Award,
    book: BookOpen,
    star: Star,
  },

  // People & Identity
  people: {
    user: User,
    users: Users,
    mail: Mail,
    phone: Phone,
    location: MapPin,
  },

  // Workflow & Actions
  workflow: {
    kanban: KanbanSquare,
    activity: Activity,
    refresh: RefreshCw,
    filter: Filter,
    search: Search,
    plus: Plus,
    send: Send,
    eye: Eye,
    message: MessageSquare,
    zap: Zap,
  },

  // System & Settings
  system: {
    settings: Settings,
    bell: Bell,
    logout: LogOut,
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
