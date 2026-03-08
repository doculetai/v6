'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { UserPlus } from '@/components/icons';
import { Container, Stack } from '@/components/layout/content-primitives';
import { EmptyState } from '@/components/ui/empty-state';
import { SessionManagementWithData } from '@/components/settings/SessionManagementWithData';
import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  copy: typeof adminCopy.settings;
  isSuperAdmin?: boolean;
};

// ── Exchange Rates Tab ─────────────────────────────────────────────────────────

function ExchangeRatesTab() {
  const fxCopy = adminCopy.exchangeRates;
  const [rateInput, setRateInput] = useState('');
  const [saved, setSaved] = useState(false);

  const { data: latestRate, refetch } = trpc.admin.getLatestFxRate.useQuery(undefined, {
    staleTime: 60_000,
  });

  const updateMutation = trpc.admin.updateFxRate.useMutation({
    onSuccess: () => {
      setSaved(true);
      void refetch();
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const isStale = latestRate
    ? Date.now() - new Date(latestRate.fetchedAt).getTime() > 24 * 60 * 60 * 1000
    : false;

  function handleSave() {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateMutation.mutate({ rateNgnPerUsd: parsed });
    }
  }

  const displayRate = latestRate ? (latestRate.rateX100 / 100).toFixed(2) : null;
  const updatedAgo = latestRate
    ? Math.round((Date.now() - new Date(latestRate.fetchedAt).getTime()) / 60000) + 'm ago'
    : '';

  return (
    <div className="space-y-4">
      {isStale && (
        <Callout variant="warning">{fxCopy.staleWarning}</Callout>
      )}
      {saved && (
        <Callout variant="success">{fxCopy.savedRate}</Callout>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="fx-rate" className="text-sm font-medium text-foreground">
          {fxCopy.rateLabel}
        </Label>
        <div className="flex gap-2">
          <Input
            id="fx-rate"
            type="number"
            step="0.01"
            min="1"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            placeholder={displayRate ?? ''}
            className="font-mono w-40"
          />
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !rateInput}
            className="min-h-11"
          >
            {fxCopy.saveRate}
          </Button>
        </div>
      </div>

      {displayRate && (
        <p className="text-xs text-muted-foreground">
          {fxCopy.autoPulled(displayRate, updatedAgo)}
        </p>
      )}
    </div>
  );
}

// ── Rejection Templates Tab ────────────────────────────────────────────────────

function RejectionTemplatesTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const tplCopy = adminCopy.rejectionTemplateSettings;
  const [templates, setTemplates] = useState<string[]>([...adminCopy.rejectionTemplates]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTemplate, setNewTemplate] = useState('');

  if (!isSuperAdmin) {
    return (
      <Callout variant="warning">{tplCopy.superAdminOnly}</Callout>
    );
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditValue(templates[index] ?? '');
  }

  function saveEdit() {
    if (editingIndex === null) return;
    setTemplates((prev) => {
      const next = [...prev];
      next[editingIndex] = editValue;
      return next;
    });
    setEditingIndex(null);
    setEditValue('');
  }

  function archive(index: number) {
    setTemplates((prev) => prev.filter((_, i) => i !== index));
  }

  function addNew() {
    if (!newTemplate.trim()) return;
    setTemplates((prev) => [...prev, newTemplate.trim()]);
    setNewTemplate('');
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {templates.map((tpl, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
            {editingIndex === i ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={saveEdit} className="min-h-9 text-xs">
                  {tplCopy.saveEdit}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingIndex(null)}
                  className="min-h-9 text-xs"
                >
                  {tplCopy.cancelEdit}
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">{tpl}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(i)}
                  className="min-h-9 text-xs text-muted-foreground"
                >
                  {tplCopy.editAction}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => archive(i)}
                  className="min-h-9 text-xs text-destructive hover:text-destructive"
                >
                  {tplCopy.archiveAction}
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          placeholder={tplCopy.addNew}
          className="flex-1 text-sm"
          onKeyDown={(e) => { if (e.key === 'Enter') addNew(); }}
        />
        <Button onClick={addNew} disabled={!newTemplate.trim()} className="min-h-11 text-xs">
          {tplCopy.addNew}
        </Button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const TAB_CLASSES =
  'relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none';

// ── Team Tab ──────────────────────────────────────────────────────────────────

function TeamTab() {
  const teamCopy = adminCopy.settings.team;

  return (
    <Stack gap="md">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{teamCopy.title}</h2>
        <p className="text-sm text-muted-foreground">{teamCopy.description}</p>
      </div>
      <div>
        <Button variant="outline" className="min-h-11">
          <UserPlus size={16} weight="duotone" className="mr-2" />
          {teamCopy.inviteCta}
        </Button>
      </div>
      <EmptyState
        heading={teamCopy.empty.title}
        body={teamCopy.empty.description}
      />
    </Stack>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function AdminSettingsPageClient({ copy, isSuperAdmin = false }: Props) {
  const tabCopy = copy.tabs;

  return (
    <Container width="md" noPadding><Stack gap="md">
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">{copy.subtitle}</p>
      </div>

      <Tabs defaultValue="security">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="security" className={TAB_CLASSES}>
            {tabCopy.security}
          </TabsTrigger>
          <TabsTrigger value="notifications" className={TAB_CLASSES}>
            {tabCopy.notifications}
          </TabsTrigger>
          <TabsTrigger value="team" className={TAB_CLASSES}>
            {tabCopy.team}
          </TabsTrigger>
        </TabsList>

        {/* Security tab */}
        <TabsContent value="security" className="mt-6 outline-none">
          <Stack gap="md">
            <Card className="border-border bg-card dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-card-foreground">
                  {copy.sections.security.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {copy.sections.security.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionManagementWithData />
              </CardContent>
            </Card>

            {/* Super Admin sub-tabs: Exchange Rates + Templates */}
            <Card className="border-border bg-card dark:border-border dark:bg-card">
              <Tabs defaultValue="exchange-rates">
                <TabsList className="h-auto w-full justify-start gap-0 rounded-none rounded-t-xl border-b border-border bg-transparent p-0">
                  <TabsTrigger value="exchange-rates" className={TAB_CLASSES}>
                    {adminCopy.exchangeRates.tabLabel}
                  </TabsTrigger>
                  <TabsTrigger value="templates" className={TAB_CLASSES}>
                    {adminCopy.rejectionTemplateSettings.tabLabel}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="exchange-rates" className="p-6 outline-none">
                  <ExchangeRatesTab />
                </TabsContent>
                <TabsContent value="templates" className="p-6 outline-none">
                  <RejectionTemplatesTab isSuperAdmin={isSuperAdmin} />
                </TabsContent>
              </Tabs>
            </Card>
          </Stack>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications" className="mt-6 outline-none">
          <Card className="border-border bg-card dark:border-border dark:bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-card-foreground">
                {copy.sections.notifications.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {copy.sections.notifications.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {copy.sections.notifications.comingSoon}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team tab */}
        <TabsContent value="team" className="mt-6 outline-none">
          <TeamTab />
        </TabsContent>
      </Tabs>
    </Stack></Container>
  );
}
