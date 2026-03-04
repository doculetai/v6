"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface ErrorStateProps {
  heading: string;
  body: string;
  action?: ErrorStateAction;
  secondaryAction?: ErrorStateAction;
  illustration?: React.ReactNode;
  className?: string;
}

function ActionButton({
  action,
  variant = "default",
}: {
  action: ErrorStateAction;
  variant?: "default" | "outline";
}) {
  if (action.href) {
    return (
      <Button variant={variant} asChild>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

function ErrorState({
  heading,
  body,
  action,
  secondaryAction,
  illustration,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      {illustration ? (
        <div className="mx-auto max-w-[160px] mb-6">{illustration}</div>
      ) : (
        <AlertTriangle className="mb-6 size-12 text-muted-foreground" />
      )}

      <h3 className="text-lg font-semibold text-foreground">{heading}</h3>

      <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
        {body}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-row items-center gap-3">
          {action && <ActionButton action={action} variant="default" />}
          {secondaryAction && (
            <ActionButton action={secondaryAction} variant="outline" />
          )}
        </div>
      )}
    </div>
  );
}

export { ErrorState };
export type { ErrorStateProps, ErrorStateAction };
