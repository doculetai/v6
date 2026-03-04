'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminCopy } from '@/config/copy/admin';

import type { AnalyticsPeriodPoint } from '@/db/queries/admin-analytics';

interface AdminAnalyticsChartProps {
  byWeek: AnalyticsPeriodPoint[];
  byMonth: AnalyticsPeriodPoint[];
  className?: string;
}

type Period = 'week' | 'month';

const copy = adminCopy.analytics;

export function AdminAnalyticsChart({ byWeek, byMonth, className }: AdminAnalyticsChartProps) {
  const [period, setPeriod] = useState<Period>('month');
  const data = period === 'week' ? byWeek : byMonth;
  const maxCount = Math.max(...data.map((p) => p.count), 1);
  const hasData = data.some((p) => p.count > 0);

  return (
    <div className={cn('rounded-xl border bg-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{copy.chart.title}</p>
          <p className="text-xs text-muted-foreground">{copy.chart.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant={period === 'month' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setPeriod('month')}
            aria-pressed={period === 'month'}
          >
            {copy.period.month}
          </Button>
          <Button
            size="sm"
            variant={period === 'week' ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setPeriod('week')}
            aria-pressed={period === 'week'}
          >
            {copy.period.week}
          </Button>
        </div>
      </div>

      {hasData ? (
        <div
          className="mt-6 flex h-48 items-end gap-1 sm:gap-2"
          role="img"
          aria-label={copy.chart.ariaLabel}
        >
          {data.map((point) => {
            const heightPercent = Math.max((point.count / maxCount) * 100, point.count > 0 ? 4 : 1);
            return (
              <div
                key={point.period}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] tabular-nums leading-none text-muted-foreground sm:text-xs">
                  {point.count > 0 ? point.count : ''}
                </span>
                <div
                  className="w-full rounded-t-sm bg-primary/70 transition-colors duration-150 hover:bg-primary"
                  style={{ height: `${heightPercent}%` }}
                  aria-hidden="true"
                />
                <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground sm:text-xs">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">{copy.chart.empty}</p>
        </div>
      )}
    </div>
  );
}
