'use client';

import { Command } from 'cmdk';
import { MagnifyingGlass, Moon, GearSix } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useTheme } from '@/components/theme-provider';

import type { DashboardRole } from '@/config/roles';
import { getNavConfig } from '@/config/nav';
import type { NavItem } from '@/config/nav/types';
import { primitivesCopy } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

type CommandPaletteProps = {
  role: DashboardRole;
};

function flattenItems(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    if (!item.disabled) result.push(item);
    if (item.children) {
      result.push(...flattenItems(item.children));
    }
  }
  return result;
}

export function CommandPalette({ role }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toggleMode } = useTheme();

  const navConfig = getNavConfig(role);
  const allItems = flattenItems(navConfig.items);
  const paletteCopy = primitivesCopy.commandPalette;

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const handleToggleTheme = useCallback(() => {
    toggleMode();
    setOpen(false);
  }, [toggleMode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        role="presentation"
      />

      {/* Palette */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-lg px-4">
        <Command
          className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          label={primitivesCopy.commandPalette.label}
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
            <Command.Input
              placeholder={primitivesCopy.commandPalette.placeholder}
              className="flex-1 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {primitivesCopy.commandPalette.noResults}
            </Command.Empty>

            {navConfig.groups.map((group) => {
              const groupItems = allItems.filter((item) => item.group === group.id);
              if (groupItems.length === 0) return null;
              return (
                <Command.Group
                  key={group.id}
                  heading={group.label}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {groupItems.map((item) => (
                    <CommandItem key={item.href} item={item} onSelect={handleSelect} />
                  ))}
                </Command.Group>
              );
            })}

            {/* Ungrouped items */}
            {(() => {
              const ungrouped = allItems.filter((item) => !item.group);
              if (ungrouped.length === 0) return null;
              return (
                <Command.Group>
                  {ungrouped.map((item) => (
                    <CommandItem key={item.href} item={item} onSelect={handleSelect} />
                  ))}
                </Command.Group>
              );
            })()}

            {/* Quick actions */}
            <Command.Group
              heading={paletteCopy.quickActionsGroup}
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              <Command.Item
                value={paletteCopy.toggleTheme}
                onSelect={handleToggleTheme}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                  'text-foreground transition-colors',
                  'data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary',
                )}
              >
                <Moon className="size-4 shrink-0" weight="duotone" aria-hidden="true" />
                <p className="truncate font-medium">{paletteCopy.toggleTheme}</p>
              </Command.Item>
              <Command.Item
                value={paletteCopy.goToSettings}
                onSelect={() => handleSelect(`/dashboard/${role}/settings`)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                  'text-foreground transition-colors',
                  'data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary',
                )}
              >
                <GearSix className="size-4 shrink-0" weight="duotone" aria-hidden="true" />
                <p className="truncate font-medium">{paletteCopy.goToSettings}</p>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  item,
  onSelect,
}: {
  item: NavItem;
  onSelect: (href: string) => void;
}) {
  const Icon = item.icon;
  return (
    <Command.Item
      value={`${item.label} ${item.description ?? ''}`}
      onSelect={() => onSelect(item.href)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
        'text-foreground transition-colors',
        'data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary',
      )}
    >
      <Icon className="size-4 shrink-0" weight="duotone" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.label}</p>
        {item.description && (
          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
    </Command.Item>
  );
}
