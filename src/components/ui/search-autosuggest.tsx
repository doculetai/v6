'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MagnifyingGlass, CircleNotch } from '@/components/icons';

import { primitivesCopy } from '@/config/copy/primitives';
import { cn } from '@/lib/utils';

type Suggestion = {
  id: string;
  label: string;
  /** Optional secondary text shown to the right */
  detail?: string;
};

type SearchAutosuggestProps = {
  /** Current search query */
  query: string;
  /** Called when query changes */
  onQueryChange: (query: string) => void;
  /** Suggestions to display in the dropdown */
  suggestions: Suggestion[];
  /** Called when a suggestion is selected */
  onSelect?: (suggestion: Suggestion) => void;
  /** Whether suggestions are loading */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Ghost text hint shown below the input */
  tabHint?: string;
  className?: string;
};

export function SearchAutosuggest({
  query,
  onQueryChange,
  suggestions,
  onSelect,
  isLoading = false,
  placeholder,
  tabHint,
  className,
}: SearchAutosuggestProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Determine the ghost text: the first suggestion that starts with the current query
  const ghostMatch = query.length >= 2
    ? suggestions.find((s) => s.label.toLowerCase().startsWith(query.toLowerCase()))
    : null;
  const ghostText = ghostMatch ? ghostMatch.label : null;

  const showDropdown = isFocused && query.length >= 2 && (suggestions.length > 0 || isLoading);

  // Wrap onQueryChange to also reset active index
  const handleQueryChange = useCallback(
    (nextQuery: string) => {
      setActiveIndex(-1);
      onQueryChange(nextQuery);
    },
    [onQueryChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Tab to accept ghost suggestion
      if (e.key === 'Tab' && ghostText && !e.shiftKey) {
        e.preventDefault();
        handleQueryChange(ghostText);
        if (ghostMatch && onSelect) {
          onSelect(ghostMatch);
        }
        return;
      }

      if (!showDropdown) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[activeIndex];
        if (selected) {
          handleQueryChange(selected.label);
          onSelect?.(selected);
          setIsFocused(false);
          inputRef.current?.blur();
        }
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [ghostText, ghostMatch, showDropdown, suggestions, activeIndex, handleQueryChange, onSelect],
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className={cn('relative', className)}>
      {/* Input wrapper with ghost text overlay */}
      <div className="relative">
        {/* Ghost text layer — sits behind the real input */}
        {ghostText && isFocused ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden"
            aria-hidden="true"
          >
            <span className="truncate pl-10 text-sm text-muted-foreground/40">
              {ghostText}
            </span>
          </div>
        ) : null}

        <MagnifyingGlass
          weight="duotone"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          aria-controls="suggestion-listbox"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setIsFocused(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isLoading && 'pr-10',
          )}
        />

        {isLoading ? (
          <CircleNotch
            weight="bold"
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {/* Tab hint */}
      {ghostText && isFocused && tabHint ? (
        <p className="mt-1 text-xs text-muted-foreground" aria-hidden="true">
          {tabHint}
        </p>
      ) : null}

      {/* Suggestion dropdown */}
      {showDropdown ? (
        <ul
          id="suggestion-listbox"
          ref={listRef}
          role="listbox"
          className={cn(
            'absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                activeIndex === index
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleQueryChange(item.label);
                onSelect?.(item);
                setIsFocused(false);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="truncate">{item.label}</span>
              {item.detail ? (
                <span className="shrink-0 text-xs text-muted-foreground">{item.detail}</span>
              ) : null}
            </li>
          ))}

          {isLoading && suggestions.length === 0 ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground" role="presentation">
              <CircleNotch weight="bold" className="size-3.5 animate-spin" aria-hidden="true" />
              <span>{primitivesCopy.searchAutosuggest.searching}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
