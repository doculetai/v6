'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { CaretDown, Check } from '@/components/icons';

import { Input } from '@/components/ui/input';
import { primitivesCopy } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

type CountryEntry = {
  code: string;
  dialCode: string;
  name: string;
};

/**
 * Country codes relevant to the Nigerian international-education market.
 * Flags are rendered via Unicode regional indicator symbols — these are
 * standard functional identifiers, not decorative emoji.
 */
const COUNTRIES: CountryEntry[] = [
  { code: 'NG', dialCode: '+234', name: 'Nigeria' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' },
  { code: 'CA', dialCode: '+1', name: 'Canada' },
  { code: 'GH', dialCode: '+233', name: 'Ghana' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa' },
  { code: 'KE', dialCode: '+254', name: 'Kenya' },
  { code: 'AU', dialCode: '+61', name: 'Australia' },
  { code: 'DE', dialCode: '+49', name: 'Germany' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'IE', dialCode: '+353', name: 'Ireland' },
  { code: 'AE', dialCode: '+971', name: 'UAE' },
];

/** Convert ISO 3166-1 alpha-2 to flag emoji via regional indicator symbols. */
function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('');
}

export interface PhoneInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'type' | 'onChange' | 'value'> {
  /** ISO country code for default selection. Defaults to 'NG'. */
  defaultCountry?: string;
  /** Called with the full international number: "+234 8012345678" */
  onChange?: (value: string) => void;
  /** Full international number value */
  value?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, defaultCountry = 'NG', onChange, value = '', ...props }, ref) => {
    const [selected, setSelected] = useState<CountryEntry>(
      () => COUNTRIES.find((c) => c.code === defaultCountry) ?? COUNTRIES[0],
    );
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
      if (!open) return;

      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }

      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleCountrySelect = useCallback(
      (country: CountryEntry) => {
        setSelected(country);
        setOpen(false);
        const phoneOnly = value.replace(/^\+\d+\s?/, '');
        onChange?.(`${country.dialCode} ${phoneOnly}`);
      },
      [value, onChange],
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d\s\-()]/g, '');
        onChange?.(`${selected.dialCode} ${raw}`);
      },
      [selected, onChange],
    );

    // Strip dial code prefix to display only the local number in the input
    const phoneOnly = value.replace(new RegExp(`^\\${selected.dialCode.replace('+', '\\+')}\\s?`), '');

    return (
      <div ref={containerRef} className="relative flex">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-l-md border border-r-0 border-input bg-muted/50 px-2.5 text-sm',
            'transition-colors hover:bg-muted/80',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
          aria-label={primitivesCopy.phoneInput.selectCountry}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="text-base leading-none" aria-hidden="true">
            {countryFlag(selected.code)}
          </span>
          <span className="text-xs text-muted-foreground">{selected.dialCode}</span>
          <CaretDown
            weight="bold"
            className={cn('size-3 text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        <Input
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={phoneOnly}
          onChange={handleInputChange}
          className={cn('rounded-l-none border-l-0', className)}
          {...props}
        />

        {open ? (
          <ul
            role="listbox"
            className={cn(
              'absolute left-0 top-full z-50 mt-1 max-h-56 w-64 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md',
              'animate-in fade-in-0 zoom-in-95',
            )}
          >
            {COUNTRIES.map((country) => {
              const isSelected = selected.code === country.code;
              return (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                  )}
                  onClick={() => handleCountrySelect(country)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCountrySelect(country);
                    }
                  }}
                  tabIndex={0}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {countryFlag(country.code)}
                  </span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                  {isSelected ? (
                    <Check weight="bold" className="size-3.5 text-primary" aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput, COUNTRIES, countryFlag };
