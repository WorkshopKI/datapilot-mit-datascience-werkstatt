// Zentrale Icon-Definitionen für alle Kategorien
// Ersetzt bunte Emojis durch einheitliche Lucide Icons

import {
  // Problemtypen
  UserMinus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  Wrench,
  Users,
  Target,
  // Branchen
  Smartphone,
  ShoppingCart,
  Cloud,
  Play,
  Landmark,
  Shield,
  Store,
  UtensilsCrossed,
  Zap,
  Heart,
  Factory,
  Truck,
  Lock,
  Briefcase,
  Home,
  Car,
  GraduationCap,
  Building,
  // Meeting-Typen
  Rocket,
  Database,
  BarChart3,
  GitBranch,
  RotateCcw,
  // ROI-Rechner
  ShieldAlert,
  BarChart2,
  // Seiten
  ClipboardList,
  LayoutGrid,
  FileText,
  Calendar,
  MessageCircle,
  Calculator,
  Search,
  BookOpen,
  Stethoscope,
  // Diagnose & Rollen
  Handshake,
  FlaskConical,
  Monitor,
  LineChart,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

// Problemtypen (7 Stück)
export const problemTypeIcons: Record<string, LucideIcon> = {
  churn: UserMinus,
  conversion: TrendingUp,
  risk: AlertTriangle,
  demand: Package,
  maintenance: Wrench,
  segmentation: Users,
  recommendation: Target,
};

// Branchen (19 Stück)
export const industryIcons: Record<string, LucideIcon> = {
  telekom: Smartphone,
  ecommerce: ShoppingCart,
  saas: Cloud,
  streaming: Play,
  bank: Landmark,
  versicherung: Shield,
  einzelhandel: Store,
  gastro: UtensilsCrossed,
  energie: Zap,
  gesundheit: Heart,
  hr: Users,
  fertigung: Factory,
  logistik: Truck,
  'it-security': Lock,
  jobportal: Briefcase,
  immobilien: Home,
  automobil: Car,
  bildung: GraduationCap,
  gebaeude: Building,
};

// Meeting-Typen (5 Stück)
export const meetingTypeIcons: Record<string, LucideIcon> = {
  kickoff: Rocket,
  'data-review': Database,
  'model-review': BarChart3,
  'go-nogo': GitBranch,
  retrospective: RotateCcw,
};

// ROI-Rechner (4 Stück)
export const roiTypeIcons: Record<string, LucideIcon> = {
  churn: UserMinus,
  fraud: ShieldAlert,
  conversion: TrendingUp,
  demand: BarChart2,
};

// Seiten-Header Icons
export const pageIcons: Record<string, LucideIcon> = {
  planen: ClipboardList,
  'projekt-planen': LayoutGrid,
  checkliste: FileText,
  'im-projekt': Wrench,
  meeting: Calendar,
  stakeholder: MessageCircle,
  roi: Calculator,
  nachschlagen: Search,
  begriffe: BookOpen,
  diagnose: Stethoscope,
};

// Diagnose-Typen (5 Stück)
export const diagnosisTypeIcons: Record<string, LucideIcon> = {
  performance: TrendingDown,
  data: Database,
  stakeholder: Handshake,
  deployment: Rocket,
  project: ClipboardList,
};

// Rollen-Icons (5 Stück)
export const roleIcons: Record<string, LucideIcon> = {
  stakeholder: Briefcase,
  fachexperte: FlaskConical,
  dataEngineer: Wrench,
  it: Monitor,
  biAnalyst: BarChart2,
};

// DS-Kategorien (5 Stück)
export const termCategoryIcons: Record<string, LucideIcon> = {
  metriken: BarChart3,
  fehler: AlertTriangle,
  modell: Wrench,
  validierung: LineChart,
  projekt: Building,
};

// Business-Kategorien (4 Stück)
export const businessCategoryIcons: Record<string, LucideIcon> = {
  genauigkeit: BarChart3,
  vertrauen: HelpCircle,
  risiken: AlertTriangle,
  betrieb: RefreshCw,
};

// Helper-Funktionen für typsicheren Zugriff
export function getProblemTypeIcon(id: string): LucideIcon {
  return problemTypeIcons[id] || Target;
}

export function getIndustryIcon(id: string): LucideIcon {
  return industryIcons[id] || Building;
}

export function getMeetingTypeIcon(id: string): LucideIcon {
  return meetingTypeIcons[id] || Calendar;
}

export function getROITypeIcon(id: string): LucideIcon {
  return roiTypeIcons[id] || Calculator;
}

export function getDiagnosisTypeIcon(id: string): LucideIcon {
  return diagnosisTypeIcons[id] || Stethoscope;
}

export function getRoleIcon(id: string): LucideIcon {
  return roleIcons[id] || Briefcase;
}

export function getTermCategoryIcon(id: string): LucideIcon {
  return termCategoryIcons[id] || BookOpen;
}

export function getBusinessCategoryIcon(id: string): LucideIcon {
  return businessCategoryIcons[id] || HelpCircle;
}
