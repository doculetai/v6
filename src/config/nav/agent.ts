import { BookOpen, Briefcase, Home, MessageSquareText, UsersRound } from 'lucide-react';

import type { NavItem } from './types';

export const agentNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard/agent', icon: Home },
  { label: 'Students', href: '/dashboard/agent/students', icon: UsersRound },
  { label: 'Cases', href: '/dashboard/agent/cases', icon: Briefcase },
  { label: 'Messages', href: '/dashboard/agent/messages', icon: MessageSquareText },
  { label: 'Resources', href: '/dashboard/agent/resources', icon: BookOpen },
];
