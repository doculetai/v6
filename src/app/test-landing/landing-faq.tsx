"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal } from "./_shared";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {copy.faq.headline}
            </h2>
            <p className="hidden text-[13px] font-medium text-muted-foreground md:block">
              {copy.faq.items.length} questions
            </p>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-[#4747D4]/30 via-[#4747D4]/10 to-transparent" />
        </Reveal>

        <div className="mt-10 space-y-3 md:mt-12">
          {copy.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.question} delay={i * 60}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200",
                    isOpen
                      ? "border-[#4747D4]/30 shadow-md ring-1 ring-[#4747D4]/10"
                      : "border-border",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left text-[15px] font-semibold text-foreground md:px-6 md:py-5"
                  >
                    {item.question}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-[#4747D4]",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border px-5 pb-5 pt-4 md:px-6">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
