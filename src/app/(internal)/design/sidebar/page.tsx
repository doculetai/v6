import type { Metadata } from 'next';

import { SidebarDesignClient } from './sidebar-design-client';

export const metadata: Metadata = {
  title: 'Sidebar Design — Doculet',
  robots: { index: false, follow: false },
};

export default function SidebarDesignPage() {
  return <SidebarDesignClient />;
}
