'use client';

import { UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

const sponsorCopy = studentCopy.sponsorInvite;

export function StudentSponsorInviteCard() {
  const [email, setEmail] = useState('');
  const utils = trpc.useUtils();

  const invitesQuery = trpc.student.listSponsorInvites.useQuery();
  const inviteMutation = trpc.student.inviteSponsorByEmail.useMutation({
    onSuccess: async () => {
      setEmail('');
      await utils.student.listSponsorInvites.invalidate();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inviteMutation.mutate({ email });
  };

  return (
    <Card className="border-border bg-card/95 dark:border-border dark:bg-card/90">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-card-foreground dark:text-card-foreground">
          <UserPlus className="size-5" aria-hidden="true" />
          <CardTitle className="text-lg md:text-xl">{sponsorCopy.title}</CardTitle>
        </div>
        <CardDescription>{sponsorCopy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sponsor-email">{sponsorCopy.inviteByEmail.label}</Label>
            <Input
              id="sponsor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={sponsorCopy.inviteByEmail.inputHint}
              required
            />
          </div>
          <Button type="submit" disabled={inviteMutation.isPending} className="min-h-11 w-full">
            {sponsorCopy.inviteByEmail.sendCta}
          </Button>
        </form>

        {invitesQuery.data && invitesQuery.data.length > 0 ? (
          <ul className="space-y-2" aria-label="Sponsor invitations">
            {invitesQuery.data.map((inv) => (
              <li
                key={inv.id}
                className="rounded-lg border border-border bg-background/80 px-3 py-2 text-sm dark:bg-background/60"
              >
                <span className="font-medium text-foreground dark:text-foreground">{inv.inviteeEmail}</span>
                <span className="ml-2 text-muted-foreground dark:text-muted-foreground">
                  — {(sponsorCopy.status as Record<string, string>)[inv.status] ?? inv.status}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
