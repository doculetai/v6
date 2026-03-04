"use client"

import { useState } from "react"

import { universityCopy } from "@/config/copy/university"
import type { PipelineRow } from "@/db/queries/university-pipeline"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoneyValue } from "@/components/ui/money-value"

interface UniversityPipelineReviewDialogProps {
  row: PipelineRow
  open: boolean
  onClose: () => void
}

function UniversityPipelineReviewDialog({
  row,
  open,
  onClose,
}: UniversityPipelineReviewDialogProps) {
  const [notes, setNotes] = useState("")

  const reviewMutation = trpc.university.reviewApplication.useMutation({
    onSuccess: () => {
      setNotes("")
      onClose()
    },
  })

  function handleAction(action: "approved" | "rejected" | "more_info_requested") {
    reviewMutation.mutate({
      documentId: row.id,
      action,
      rejectionReason: notes.trim() || undefined,
    })
  }

  const isPending = reviewMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{universityCopy.pipeline.reviewDialog.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground">{row.studentEmail}</p>
            {row.program ? (
              <p className="text-xs text-muted-foreground">{row.program}</p>
            ) : null}
            {row.amountKobo > 0 ? (
              <MoneyValue amountMinor={row.amountKobo} display="compact" />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-notes">
              {universityCopy.pipeline.reviewDialog.notesLabel}
            </Label>
            <textarea
              id="review-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={universityCopy.pipeline.reviewDialog.notesPlaceholder}
              rows={3}
              disabled={isPending}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {reviewMutation.error ? (
            <p className="text-sm text-destructive" role="alert">
              {reviewMutation.error.message}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {universityCopy.pipeline.reviewDialog.cancel}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction("more_info_requested")}
            disabled={isPending}
          >
            {universityCopy.pipeline.reviewDialog.requestInfoCta}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction("rejected")}
            disabled={isPending}
          >
            {universityCopy.pipeline.reviewDialog.rejectCta}
          </Button>
          <Button onClick={() => handleAction("approved")} disabled={isPending}>
            {universityCopy.pipeline.reviewDialog.approveCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { UniversityPipelineReviewDialog }
export type { UniversityPipelineReviewDialogProps }
