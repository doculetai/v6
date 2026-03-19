"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { X } from '@/components/icons'

import { cn } from "@/lib/utils"
import { primitivesCopy } from "@/config/copy/primitives"

function FullscreenDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="fullscreen-dialog" {...props} />
}

function FullscreenDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="fullscreen-dialog-trigger"
      {...props}
    />
  )
}

function FullscreenDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close data-slot="fullscreen-dialog-close" {...props} />
  )
}

function FullscreenDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="fullscreen-dialog-overlay"
        className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      />
      <DialogPrimitive.Content
        data-slot="fullscreen-dialog-content"
        className={cn(
          "fixed inset-0 z-50 flex h-full w-full flex-col bg-background outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function FullscreenDialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-header"
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      <DialogPrimitive.Close className="rounded-md p-2 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <X weight="duotone" className="size-5" />
        <span className="sr-only">{primitivesCopy.dialog.closeSrOnly}</span>
      </DialogPrimitive.Close>
    </div>
  )
}

function FullscreenDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-body"
      className={cn("flex-1 overflow-y-auto px-4 py-6 sm:px-6", className)}
      {...props}
    />
  )
}

function FullscreenDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-footer"
      className={cn(
        "sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-background px-4 py-3 sm:px-6",
        className
      )}
      {...props}
    />
  )
}

function FullscreenDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="fullscreen-dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  )
}

function FullscreenDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="fullscreen-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  FullscreenDialog,
  FullscreenDialogTrigger,
  FullscreenDialogClose,
  FullscreenDialogContent,
  FullscreenDialogHeader,
  FullscreenDialogBody,
  FullscreenDialogFooter,
  FullscreenDialogTitle,
  FullscreenDialogDescription,
}
