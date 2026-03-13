'use client';

import { useState } from 'react';
import { Plus, Trash, UserCircle, Clock } from '@/components/icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

type TeamCopy = {
  title: string;
  subtitle: string;
  table: {
    name: string;
    email: string;
    role: string;
    added: string;
    actions: string;
  };
  addMember: string;
  addMemberDescription: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    submitLabel: string;
    submittingLabel: string;
  };
  roleLabels: Record<string, string>;
  removeConfirmTitle: string;
  removeConfirmDescription: string;
  removeConfirmAction: string;
  removeCancel: string;
  success: string;
  removeSuccess: string;
  error: string;
  empty: { title: string; description: string; action?: string };
};

type Props = {
  copy: TeamCopy;
};

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  reviewer: 'bg-warning/10 text-warning',
  viewer: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TeamPageClient({ copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const utils = trpc.useUtils();
  const { data: members, isLoading } =
    trpc.universityManagement.listTeamMembers.useQuery();
  const addMember = trpc.universityManagement.addTeamMember.useMutation({
    onSuccess: () => {
      void utils.universityManagement.listTeamMembers.invalidate();
      toast.success(copy.success);
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(copy.error);
    },
  });
  const removeMember = trpc.universityManagement.removeTeamMember.useMutation({
    onSuccess: () => {
      void utils.universityManagement.listTeamMembers.invalidate();
      toast.success(copy.removeSuccess);
      setRemoveId(null);
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'reviewer' | 'viewer'>('viewer');

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('viewer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    addMember.mutate({ name, email, role });
  };

  const handleRemove = () => {
    if (!removeId) return;
    removeMember.mutate({ memberId: removeId });
  };

  if (isLoading) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} />
          <div className="flex items-center justify-center py-12">
            <Clock
              className="size-6 animate-pulse text-muted-foreground"
              weight="duotone"
              aria-hidden="true"
            />
          </div>
        </Section>
      </PageShell>
    );
  }

  const addButton = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" weight="duotone" aria-hidden="true" />
          {copy.addMember}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.addMember}</DialogTitle>
          <DialogDescription>{copy.addMemberDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">{copy.form.nameLabel}</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.form.namePlaceholder}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">{copy.form.emailLabel}</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.form.emailPlaceholder}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-role">{copy.form.roleLabel}</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as 'admin' | 'reviewer' | 'viewer')}
            >
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  {copy.roleLabels.admin}
                </SelectItem>
                <SelectItem value="reviewer">
                  {copy.roleLabels.reviewer}
                </SelectItem>
                <SelectItem value="viewer">
                  {copy.roleLabels.viewer}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending
                ? copy.form.submittingLabel
                : copy.form.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <PageHeader
            title={copy.title}
            subtitle={copy.subtitle}
            breadcrumbs={breadcrumbs}
            actions={addButton}
          />

          {!members || members.length === 0 ? (
            <EmptyState heading={copy.empty.title} body={copy.empty.description} action={copy.empty.action ? { label: copy.empty.action, href: routes.dashboard.university.settings } : undefined} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.name}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.email}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.role}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.added}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      {copy.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="bg-card transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-2">
                          <UserCircle
                            className="size-5 text-muted-foreground"
                            weight="duotone"
                            aria-hidden="true"
                          />
                          {member.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            roleBadgeClass[member.role] ?? 'bg-muted text-muted-foreground',
                          )}
                        >
                          {copy.roleLabels[member.role] ?? member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-[44px] gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => setRemoveId(member.id)}
                          disabled={removeMember.isPending}
                        >
                          <Trash
                            className="size-3"
                            weight="duotone"
                            aria-hidden="true"
                          />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Section>

      <AlertDialog
        open={removeId !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.removeConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.removeConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMember.isPending}>
              {copy.removeCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMember.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {copy.removeConfirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
