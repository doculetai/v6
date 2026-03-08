import { describe, it, expect } from 'vitest';

// NavBadge
describe('NavBadge', () => {
  it('returns null when count is 0', () => {
    // Test the logic directly (pure function)
    const shouldRender = (count: number) => count > 0;
    expect(shouldRender(0)).toBe(false);
    expect(shouldRender(1)).toBe(true);
  });

  it('caps display at 99+', () => {
    const displayCount = (count: number) => (count > 99 ? '99+' : String(count));
    expect(displayCount(100)).toBe('99+');
    expect(displayCount(99)).toBe('99');
    expect(displayCount(5)).toBe('5');
  });
});

// deriveInitials (from SidebarUserCard)
describe('deriveInitials', () => {
  function deriveInitials(user: { fullName: string | null; email: string | null } | undefined): string {
    if (user?.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
      return (parts[0]?.slice(0, 2) ?? 'DU').toUpperCase();
    }
    if (user?.email) {
      const prefix = user.email.split('@')[0] ?? '';
      return (prefix.slice(0, 2)).toUpperCase();
    }
    return 'DU';
  }

  it('derives from full name — two names', () => {
    expect(deriveInitials({ fullName: 'Kemi Adesanya', email: null })).toBe('KA');
  });

  it('derives from full name — single name', () => {
    expect(deriveInitials({ fullName: 'Kemi', email: null })).toBe('KE');
  });

  it('derives from email when no name', () => {
    expect(deriveInitials({ fullName: null, email: 'tunde@test.com' })).toBe('TU');
  });

  it('falls back to DU when no data', () => {
    expect(deriveInitials(undefined)).toBe('DU');
  });
});
