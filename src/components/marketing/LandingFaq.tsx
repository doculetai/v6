'use client';

import { useState } from 'react';
import { CaretDown } from '@/components/icons';
import { cn } from '@/lib/utils';
import { landingCopy as copy } from '@/config/copy/landing';
import { LandingReveal } from './LandingReveal';

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-b border-border bg-[#F1F5F9] py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <LandingReveal>
          <div className="mb-2 flex items-end justify-between">
            <h2
              className="text-section-h2 font-serif font-semibold tracking-tight text-[#2B39A3]"
            >
              {copy.faq.headline}
            </h2>
          </div>
          <div className="h-px bg-[linear-gradient(90deg,rgba(43,57,163,0.3),rgba(43,57,163,0.08),transparent)]" />
        </LandingReveal>

        <div className="mt-8 space-y-3">
          {copy.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <LandingReveal key={item.question} delay={i * 50}>
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow',
                    isOpen ? 'border-[rgba(43,57,163,0.3)] shadow-md' : 'border-border',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/30 md:px-6 md:py-5"
                  >
                    {item.question}
                    <CaretDown
                      weight="duotone"
                      size={16}
                      className={cn(
                        'shrink-0 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180 text-[#2B39A3]',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div id={`faq-panel-${i}`} className="border-t border-border px-5 pb-5 pt-4 md:px-6">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </LandingReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
