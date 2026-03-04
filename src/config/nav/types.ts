import type { LucideIcon } from 'lucide-react';

export type NavGroup = {
  id: string;
  label: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  description?: string;
  group?: string;
  children?: NavItem[];
  isPrimary?: boolean;
  mobileHidden?: boolean;
};

export type NavConfig = {
  groups: NavGroup[];
  items: NavItem[];
};
