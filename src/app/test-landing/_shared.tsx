'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

  return (
    <div
      ref={ref}
      className={cn(
        shouldAnimate
          ? cn("transition-all duration-700 ease-out", delay > 0 && `[transition-delay:${delay}ms]`)
          : "",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
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
          "min-h-13 rounded-xl px-7 text-sm font-bold",
          isDark
            ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <Link href="/signup">
          {primary}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "min-h-13 rounded-xl px-7 text-sm font-semibold",
          isDark
            ? "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            : "text-primary/70 hover:bg-primary/5 hover:text-primary",
        )}
      >
        <Link href="/verify">
          {secondary}
        </Link>
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
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-success/20 bg-success/10 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <p className="text-sm font-medium text-success">
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
          "min-h-13 flex-1 rounded-xl border px-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isDark
            ? "border-white/15 bg-white/[0.07] text-white placeholder:text-white/50 focus:ring-offset-primary"
            : "border-border bg-card text-foreground placeholder:text-muted-foreground",
        )}
      />
      <Button
        type="submit"
        className={cn(
          "min-h-13 shrink-0 rounded-xl px-6 text-sm font-bold",
          isDark
            ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {buttonText}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </form>
  );
}
