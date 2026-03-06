'use client';

import { useState } from 'react';
import { GraduationCap, ArrowsClockwise } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

export type StudentSettings = {
  schoolId: string | null;
  schoolName: string | null;
  schoolCountry: string | null;
  programId: string | null;
  programName: string | null;
  fundingType: string | null;
};

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
    <Card className="border-border bg-card">
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
                {settings.schoolName ?? 'No school selected'}
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
              <Label>School</Label>
              <Select value={selectedSchool} onValueChange={(v) => { setSelectedSchool(v); setSelectedProgram(''); }}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schoolsList?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.country})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentSchool && currentSchool.programs.length > 0 && (
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
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
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
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

  const inviteMutation = trpc.student.inviteSponsorByEmail.useMutation({
    onSuccess: () => utils.student.listSponsorInvites.invalidate(),
  });

  const declinedInvites = invites?.filter((i) => i.status === 'declined') ?? [];

  if (declinedInvites.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowsClockwise size={20} weight="duotone" className="text-muted-foreground" />
          <CardTitle className="text-base">Declined sponsors</CardTitle>
        </div>
        <CardDescription>Re-invite sponsors who previously declined.</CardDescription>
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
                Re-invite
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
