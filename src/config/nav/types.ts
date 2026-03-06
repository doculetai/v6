import type { Icon } from '@phosphor-icons/react';

export type NavGroup = {
  id: string;
  label: string;
};

export type NavQuickAction = {
  label: string;
  icon: Icon;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
  badge?: number;
  description?: string;
  group?: string;
  children?: NavItem[];
  isPrimary?: boolean;
  mobileHidden?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  disabledBeforeStage?: number;
};

export type NavConfig = {
  groups: NavGroup[];
  items: NavItem[];
  quickAction: NavQuickAction;
};
