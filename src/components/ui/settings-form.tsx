'use client';

import * as React from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { primitivesCopy } from '@/config/copy/primitives';

// ── SettingsShell ────────────────────────────────────────────────────────────

interface SettingsTab {
  id: string;
  label: string;
}

interface SettingsShellProps {
  tabs: SettingsTab[];
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

function SettingsShell({ tabs, children, className }: SettingsShellProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');

  return (
    <div className={cn('space-y-6', className)}>
      <nav className="flex gap-1 border-b border-border" aria-label={primitivesCopy.ariaExtended.settingsTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'min-h-[44px] px-4 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div>{children(activeTab)}</div>
    </div>
  );
}

// ── FormGrid ─────────────────────────────────────────────────────────────────

interface FormGridProps extends React.ComponentPropsWithoutRef<'div'> {
  columns?: 1 | 2;
}

function FormGrid({ columns = 2, className, children, ...props }: FormGridProps) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── FormField ────────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, htmlFor, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// ── TextInput ────────────────────────────────────────────────────────────────

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function TextInput({ error, className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground',
        'placeholder:text-muted-foreground/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive' : 'border-border',
        className,
      )}
      {...props}
    />
  );
}

export { SettingsShell, FormGrid, FormField, TextInput };
export type { SettingsShellProps, SettingsTab, FormGridProps, FormFieldProps, TextInputProps };
