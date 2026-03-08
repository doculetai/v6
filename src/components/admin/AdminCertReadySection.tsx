'use client';

import { useState } from 'react';

import { SealCheck } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { adminCopy } from '@/config/copy/admin';
import type { CertReadyStudent } from '@/db/queries/admin-operations';
import { trpc } from '@/trpc/client';

interface AdminCertReadySectionProps {
  students: CertReadyStudent[];
  onIssued: () => void;
  /** When true, the issuing admin is a super admin who can edit the expiry date */
  isSuperAdmin?: boolean;
}

const copy = adminCopy.certReady;

function defaultExpiryDate(): string {
  return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

interface IssueTarget {
  studentId: string;
  studentEmail: string;
  fullName: string | null;
  paymentStatus: 'paid' | 'waived';
}

export function AdminCertReadySection({ students, onIssued, isSuperAdmin = false }: AdminCertReadySectionProps) {
  const [issueTarget, setIssueTarget] = useState<IssueTarget | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>(defaultExpiryDate());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const issueMutation = trpc.admin.issueCertificate.useMutation({
    onSuccess: () => {
      setIssueTarget(null);
      setErrorMsg(null);
      onIssued();
    },
    onError: (err) => {
      setErrorMsg(err.message ?? copy.issueError);
    },
  });

  function handleConfirmIssue() {
    if (!issueTarget) return;
    issueMutation.mutate({
      studentId: issueTarget.studentId,
      waivePayment: issueTarget.paymentStatus === 'waived',
    });
  }

  function handleOpenIssueDialog(student: IssueTarget) {
    setIssueTarget(student);
    setExpiryDate(defaultExpiryDate());
    setErrorMsg(null);
  }

  if (students.length === 0) return null;

  return (
    <section aria-label={copy.sectionTitle}>
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        <SealCheck size={16} weight="duotone" aria-hidden="true" className="text-[#C2410C]" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {copy.sectionTitle}
        </p>
        <span className="ml-auto rounded-full bg-[#C2410C]/10 px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">
          {students.length}
        </span>
      </div>

      {/* Desktop table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.table.student}</th>
                <th className="px-4 py-3 font-medium">{copy.table.school}</th>
                <th className="px-4 py-3 font-medium">{copy.table.programme}</th>
                <th className="px-4 py-3 font-medium">{copy.table.payment}</th>
                <th className="px-4 py-3 font-medium">{copy.table.readySince}</th>
                <th className="px-4 py-3 font-medium">{copy.table.action}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.studentId}
                  className="border-t border-border/60 transition-colors hover:bg-muted/20"
                >
                  <td className="max-w-48 px-4 py-3">
                    <p className="truncate font-medium text-foreground">
                      {student.fullName ?? student.studentEmail}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{student.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{student.schoolName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.programName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={student.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {copy.paymentLabels[student.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <TimestampLabel value={student.readySince} mode="relative" />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11 text-xs"
                      onClick={() =>
                        handleOpenIssueDialog({
                          studentId: student.studentId,
                          studentEmail: student.studentEmail,
                          fullName: student.fullName,
                          paymentStatus: student.paymentStatus,
                        })
                      }
                    >
                      {copy.issueCta}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="space-y-3 p-3 md:hidden">
          {students.map((student) => (
            <article
              key={student.studentId}
              className="rounded-lg border border-border/60 p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {student.fullName ?? student.studentEmail}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{student.studentEmail}</p>
                </div>
                <Badge
                  variant={student.paymentStatus === 'paid' ? 'default' : 'secondary'}
                  className="shrink-0 text-xs"
                >
                  {copy.paymentLabels[student.paymentStatus]}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>{student.schoolName ?? '—'}</span>
                <span>{student.programName ?? '—'}</span>
                <TimestampLabel value={student.readySince} mode="relative" />
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 w-full text-xs"
                  onClick={() =>
                    handleOpenIssueDialog({
                      studentId: student.studentId,
                      studentEmail: student.studentEmail,
                      fullName: student.fullName,
                      paymentStatus: student.paymentStatus,
                    })
                  }
                >
                  {copy.issueCta}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Issue confirmation dialog */}
      <Dialog
        open={issueTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIssueTarget(null);
            setErrorMsg(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{adminCopy.certIssuance.title}</DialogTitle>
            <DialogDescription>
              {copy.issueDialog.description}
            </DialogDescription>
          </DialogHeader>

          {issueTarget && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{adminCopy.studentRecord.labels.email}</span>
                <span className="font-medium text-foreground">{issueTarget.studentEmail}</span>
              </div>
              {issueTarget.fullName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {adminCopy.studentRecord.labels.fullName}
                  </span>
                  <span className="font-mono font-medium text-foreground">{issueTarget.fullName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{copy.table.payment}</span>
                <span className="font-medium text-foreground">
                  {copy.paymentLabels[issueTarget.paymentStatus]}
                </span>
              </div>
            </div>
          )}

          {/* Expiry date */}
          <div className="space-y-1.5">
            <Label htmlFor="cert-expiry" className="text-sm font-medium text-foreground">
              {adminCopy.certIssuance.expiryLabel}
            </Label>
            {isSuperAdmin ? (
              <Input
                id="cert-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="font-mono"
              />
            ) : (
              <p id="cert-expiry" className="font-mono text-sm text-foreground">
                {expiryDate}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{adminCopy.certIssuance.expiryDefault}</p>
          </div>

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setIssueTarget(null);
                setErrorMsg(null);
              }}
              disabled={issueMutation.isPending}
            >
              {adminCopy.certIssuance.cancel}
            </Button>
            <Button
              onClick={handleConfirmIssue}
              disabled={issueMutation.isPending}
            >
              {issueMutation.isPending ? copy.issueDialog.issuing : adminCopy.certIssuance.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
