'use client';

import { useRef, useState, useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Scroll Reveal ─────────────────────────────────── */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [instant] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [instant]);

  const shouldAnimate = !instant;
  const transitionDelay =
    shouldAnimate && delay > 0 ? `${delay}ms` : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        shouldAnimate ? "transition-all duration-700 ease-out" : "",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={transitionDelay ? { transitionDelay } : undefined}
    >
      {children}
    </div>
  );
}

/* ─── CTA Button Pair ───────────────────────────────── */
export function CtaButtons({
  primary,
  secondary,
  variant = "light",
}: {
  primary: string;
  secondary: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        asChild
        className={cn(
          "min-h-[52px] rounded-xl px-7 text-[15px] font-bold",
          isDark
            ? "bg-white text-[#000080] hover:bg-white/90"
            : "bg-[#000080] text-white hover:bg-[#00006a]",
        )}
      >
        <a href="/signup">
          {primary}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </a>
      </Button>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "min-h-[52px] rounded-xl px-7 text-[15px] font-semibold",
          isDark
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-[#000080]/70 hover:bg-[#000080]/5 hover:text-[#000080]",
        )}
      >
        <a href="/verify">
          {secondary}
        </a>
      </Button>
    </div>
  );
}

/* ─── Email Capture ─────────────────────────────────── */
export function EmailCapture({
  placeholder,
  buttonText,
  variant = "light",
}: {
  placeholder: string;
  buttonText: string;
  variant?: "light" | "dark";
}) {
  const [submitted, setSubmitted] = useState(false);
  const isDark = variant === "dark";

  if (submitted) {
    return (
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/50">
        <CheckCircle2
          className={cn(
            "h-5 w-5 shrink-0",
            isDark ? "text-emerald-400" : "text-emerald-600",
          )}
        />
        <p
          className={cn(
            "text-[14px] font-medium",
            isDark
              ? "text-emerald-200"
              : "text-emerald-800 dark:text-emerald-200",
          )}
        >
          Thank you. We will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        type="email"
        placeholder={placeholder}
        required
        className={cn(
          "min-h-[52px] flex-1 rounded-xl border px-4 text-[15px] transition-all focus:outline-none focus:ring-2 focus:ring-[#8080FF] focus:ring-offset-2",
          isDark
            ? "border-white/15 bg-white/[0.07] text-white placeholder:text-white/50 focus:ring-offset-[#000080]"
            : "border-border bg-card text-foreground placeholder:text-muted-foreground",
        )}
      />
      <Button
        type="submit"
        className={cn(
          "min-h-[52px] shrink-0 rounded-xl px-6 text-[14px] font-bold",
          isDark
            ? "bg-white text-[#000080] hover:bg-white/90"
            : "bg-[#000080] text-white hover:bg-[#00006a]",
        )}
      >
        {buttonText}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </form>
  );
}
