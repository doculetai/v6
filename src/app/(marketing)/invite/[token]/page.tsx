import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Container,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { Card, CardContent } from '@/components/ui/card';
import { marketingCopy } from '@/config/copy/marketing';
import { api } from '@/trpc/server';
import { routes } from '@/config/routes';

export const metadata: Metadata = {
  title: `${marketingCopy.invite.title} — Doculet`,
  description: 'Sponsorship invitation from a student.',
};

const isValidUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

type InvitePageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const { invite } = marketingCopy;

  let preview: { found: boolean; studentEmailMasked: string | null; schoolName: string | null; message: string | null; status: 'pending' | 'accepted' | 'declined' | 'cancelled' | null } | null = null;
  if (isValidUuid(token)) {
    try {
      const caller = await api();
      preview = await caller.sponsor.getInvitePreview({ inviteId: token });
    } catch {
      preview = null;
    }
  }

  const loginHref = `/login?redirect=${encodeURIComponent(`/dashboard/sponsor/students`)}`;

  return (
    <PageShell width="narrow" className="py-8 md:py-12">
      <Section>
        <PageHeader title={invite.title} description={invite.signInPrompt} />
        <Container className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {preview?.found && preview.status === 'pending' ? (
                <>
                  {preview.studentEmailMasked && (
                    <p className="text-sm text-muted-foreground">
                      {invite.studentDescription(preview.studentEmailMasked, preview.schoolName)}
                    </p>
                  )}
                  {preview.message && (
                    <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground italic">
                      {preview.message}
                    </blockquote>
                  )}
                  {!preview.studentEmailMasked && (
                    <p className="text-sm text-muted-foreground">
                      {invite.defaultDescription}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {invite.defaultDescription}
                </p>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={loginHref}>{invite.signInCta}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.auth.signup}>{invite.createAccountCta}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
