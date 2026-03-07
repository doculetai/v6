'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type LandingRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [instant] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [visible, setVisible] = useState(instant);

  useEffect(() => {
    if (instant) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [instant]);

  return (
    <div
      ref={ref}
      style={delay > 0 && !instant ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        !instant && 'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
