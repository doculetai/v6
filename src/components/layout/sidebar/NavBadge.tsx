// Nav badge — red count pill shown on nav items with unread notifications.
// Reference: .nav-badge in docs/sidebar-preview.html
// Usage: rendered inside a nav item button, margin-left: auto pushes it to the right.
type NavBadgeProps = {
  count: number;
};

export function NavBadge({ count }: NavBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className="ml-auto flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white"
      aria-label={`${count} unread`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
