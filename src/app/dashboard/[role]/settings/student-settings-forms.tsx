'use client';

import { useState } from 'react';
import { GraduationCap, ArrowsClockwise, LockKey, IdentificationCard } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

export type StudentSettings = {
  schoolId: string | null;
  schoolName: string | null;
  schoolCountry: string | null;
  programId: string | null;
  programName: string | null;
  fundingType: string | null;
  /** D1: KYC approval status — when true, locks identity fields */
  kycApproved?: boolean;
  /** D1: Locked identity values */
  legalName?: string | null;
  dob?: string | null;
  identityNumber?: string | null;
};

// ── KYC Locked Identity Card (D1) ────────────────────────────────────────────

type KycLockedFieldProps = {
  label: string;
  value: string | null | undefined;
};

function KycLockedField({ label, value }: KycLockedFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          readOnly
          value={value ?? '\u2014'}
          className="cursor-not-allowed pr-9 opacity-70"
          aria-readonly="true"
        />
        <LockKey
          size={14}
          weight="duotone"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function KycLockedIdentityCard({ settings }: { settings: StudentSettings }) {
  if (!settings.kycApproved) return null;

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IdentificationCard size={20} weight="duotone" className="text-muted-foreground" />
          <CardTitle className="text-base">Identity details</CardTitle>
        </div>
        <CardDescription>
          These fields are locked after KYC approval. Contact support if you need to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.legalName !== undefined ? (
          <KycLockedField label="Legal name" value={settings.legalName} />
        ) : null}
        {settings.dob !== undefined ? (
          <KycLockedField label="Date of birth" value={settings.dob} />
        ) : null}
        {settings.identityNumber !== undefined ? (
          <KycLockedField label="BVN / NIN" value={settings.identityNumber ? `****${settings.identityNumber.slice(-4)}` : null} />
        ) : null}
      </CardContent>
    </Card>
  );
}

// ── Change School Card ────────────────────────────────────────────────────────

export function ChangeSchoolCard({ settings }: { settings: StudentSettings }) {
  const [editing, setEditing] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(settings.schoolId ?? '');
  const [selectedProgram, setSelectedProgram] = useState(settings.programId ?? '');
  const utils = trpc.useUtils();

  const { data: schoolsList } = trpc.student.listSchools.useQuery(
    {},
    { enabled: editing },
  );

  const mutation = trpc.student.saveSchoolProgram.useMutation({
    onSuccess: () => {
      utils.student.getStudentSettings.invalidate();
      setEditing(false);
    },
  });

  const currentSchool = schoolsList?.find((s) => s.id === selectedSchool);
  const copy = studentCopy.settings.changeSchool;

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap size={20} weight="duotone" className="text-muted-foreground" />
          <CardTitle className="text-base">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {settings.schoolName ?? copy.noSchoolSelected}
              </p>
              {settings.programName && (
                <p className="text-sm text-muted-foreground">{settings.programName}</p>
              )}
              {settings.schoolCountry && (
                <p className="text-xs text-muted-foreground">{settings.schoolCountry}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {copy.changeCta}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{copy.schoolLabel}</Label>
              <Select value={selectedSchool} onValueChange={(v) => { setSelectedSchool(v); setSelectedProgram(''); }}>
                <SelectTrigger><SelectValue placeholder={copy.schoolPlaceholder} /></SelectTrigger>
                <SelectContent>
                  {schoolsList?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.country})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentSchool && currentSchool.programs.length > 0 && (
              <div className="space-y-2">
                <Label>{copy.programLabel}</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger><SelectValue placeholder={copy.programPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    {currentSchool.programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!selectedSchool || !selectedProgram || mutation.isPending}
                onClick={() => mutation.mutate({ schoolId: selectedSchool, programId: selectedProgram })}
              >
                {mutation.isPending ? copy.savingCta : copy.saveCta}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                {copy.cancelCta}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Re-invite Sponsor Card ────────────────────────────────────────────────────

export function SponsorInvitesCard() {
  const { data: invites } = trpc.student.listSponsorInvites.useQuery();
  const utils = trpc.useUtils();
  const inviteCopy = studentCopy.settings.sponsorInvites;

  const inviteMutation = trpc.student.inviteSponsorByEmail.useMutation({
    onSuccess: () => utils.student.listSponsorInvites.invalidate(),
  });

  const declinedInvites = invites?.filter((i) => i.status === 'declined') ?? [];

  if (declinedInvites.length === 0) return null;

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowsClockwise size={20} weight="duotone" className="text-muted-foreground" />
          <CardTitle className="text-base">{inviteCopy.title}</CardTitle>
        </div>
        <CardDescription>{inviteCopy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {declinedInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm text-foreground">{invite.inviteeEmail}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={inviteMutation.isPending}
                onClick={() => inviteMutation.mutate({ email: invite.inviteeEmail })}
              >
                {inviteCopy.reinviteCta}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
