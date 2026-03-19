'use client'

import { ActionButton } from '@/components/ui/action-button';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { FilterBar } from '@/components/ui/filter-bar';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PipelineStepper } from '@/components/ui/pipeline-stepper';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DotsThree, DownloadSimple, Funnel, MagnifyingGlass, Trash } from '@/components/icons';

import { CompositionExamples } from './CompositionExamples';
import { DesignDisplayPrimitivesSection } from './DesignDisplayPrimitivesSection';
import { DesignLayoutPrimitives } from './DesignLayoutPrimitives';
import { Code, DataTableShellDemo, Section } from './_helpers';
import { designLabCopy as c } from '@/config/copy/design-lab';

const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

export function DesignDisplaySections() {
  return (
    <>
      <div className="border-t border-border/40" />

      {/* ── Interactive Primitives ── */}
      <Section id="primitives-interactive" title={c.sections.interactivePrimitives}>
        <div className="space-y-10">

          {/* Button */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Button</p>
            <Code>{`import { Button } from '@/components/ui/button'`}</Code>
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Variants</p>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Sizes</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="xs">XS</Button>
                  <Button size="sm">SM</Button>
                  <Button>Default</Button>
                  <Button size="lg">LG</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Badge</p>
            <Code>{`import { Badge } from '@/components/ui/badge'`}</Code>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Avatar</p>
            <Code>{`import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'`}</Code>
            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar size="sm"><AvatarFallback>KA</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>OA</AvatarFallback></Avatar>
                <Avatar size="lg"><AvatarFallback>SC</AvatarFallback></Avatar>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Group:</p>
                <AvatarGroup>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">KA</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">OA</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">SC</AvatarFallback></Avatar>
                  <AvatarGroupCount>+5</AvatarGroupCount>
                </AvatarGroup>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Progress</p>
            <Code>{`import { Progress } from '@/components/ui/progress'`}</Code>
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Documents uploaded</span><span>4/5</span>
                </div>
                <Progress value={80} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Verification tier</span><span>3/5</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Profile complete</span><span>25%</span>
                </div>
                <Progress value={25} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Tabs</p>
            <Code>{`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <p className="text-sm text-muted-foreground">Overview content — student funding summary, tier status.</p>
                </TabsContent>
                <TabsContent value="documents" className="mt-4">
                  <p className="text-sm text-muted-foreground">Documents content — uploaded files, status, actions.</p>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <p className="text-sm text-muted-foreground">Activity content — timeline of recent actions.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Input + Label */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Input + Label</p>
            <Code>{`import { Input } from '@/components/ui/input'; import { Label } from '@/components/ui/label'`}</Code>
            <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email-demo">Email address</Label>
                <Input id="email-demo" type="email" placeholder="kemi@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone-demo">Phone number</Label>
                <Input id="phone-demo" type="tel" placeholder="+234 800 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disabled-demo">Disabled field</Label>
                <Input id="disabled-demo" disabled value="Cannot edit" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invalid-demo">Invalid state</Label>
                <Input id="invalid-demo" aria-invalid placeholder="Invalid input" className="border-destructive focus-visible:ring-destructive/20" />
              </div>
            </div>
          </div>

          {/* ActionButton */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">ActionButton</p>
            <Code>{`import { ActionButton } from '@/components/ui/action-button'`}</Code>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
              <ActionButton variant="primary">Approve</ActionButton>
              <ActionButton variant="secondary">Cancel</ActionButton>
              <ActionButton variant="destructive">Reject</ActionButton>
              <ActionButton variant="primary" disabled>Disabled</ActionButton>
            </div>
          </div>

          {/* IconButton */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">IconButton</p>
            <Code>{`import { IconButton } from '@/components/ui/icon-button'`}</Code>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
              <IconButton tooltip="Search"><MagnifyingGlass size={20} weight="duotone" /></IconButton>
              <IconButton tooltip="Filter"><Funnel size={20} weight="duotone" /></IconButton>
              <IconButton tooltip="Download"><DownloadSimple size={20} weight="duotone" /></IconButton>
              <IconButton tooltip="More options" variant="outline"><DotsThree size={20} weight="duotone" /></IconButton>
              <IconButton tooltip="Delete" variant="ghost"><Trash size={20} weight="duotone" /></IconButton>
            </div>
          </div>

        </div>
      </Section>

      <DesignDisplayPrimitivesSection />

      <div className="border-t border-border/40" />

      {/* ── Data Primitives ── */}
      <Section id="primitives-data" title={c.sections.dataPrimitives}>
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="font-medium text-foreground">ActivityTimeline</p>
            <Code>{`import { ActivityTimeline } from '@/components/ui/activity-timeline'`}</Code>
            <ActivityTimeline
              items={[
                {
                  id: '1',
                  title: 'Proof of funds verified',
                  description: 'University of Lagos confirmed the document.',
                  timestamp: tenMinutesAgo.toISOString(),
                  tone: 'success',
                },
                {
                  id: '2',
                  title: 'Document flagged for review',
                  description: 'Admission letter requires re-upload.',
                  timestamp: twoHoursAgo.toISOString(),
                  tone: 'warning',
                },
                {
                  id: '3',
                  title: 'Sponsorship disbursement scheduled',
                  timestamp: oneDayAgo.toISOString(),
                  tone: 'info',
                },
                {
                  id: '4',
                  title: 'Identity verification submitted',
                  timestamp: threeDaysAgo.toISOString(),
                  tone: 'neutral',
                },
              ]}
            />
          </div>

          <div className="space-y-3">
            <p className="font-medium text-foreground">PipelineStepper</p>
            <Code>{`import { PipelineStepper } from '@/components/ui/pipeline-stepper'`}</Code>
            <div className="rounded-xl border border-border bg-card p-5">
              <PipelineStepper
                steps={[
                  { id: 's1', label: 'Identity verified', status: 'completed' },
                  { id: 's2', label: 'School enrolled', status: 'completed' },
                  { id: 's3', label: 'Documents uploaded', status: 'current' },
                  { id: 's4', label: 'Proof of funds issued', status: 'upcoming' },
                  { id: 's5', label: 'Disbursement', status: 'blocked' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-foreground">FilterBar</p>
            <Code>{`import { FilterBar } from '@/components/ui/filter-bar'`}</Code>
            <FilterBar
              query=""
              chips={[
                { key: 'all', label: 'All', count: 42 },
                { key: 'pending', label: 'Pending', count: 8 },
                { key: 'verified', label: 'Verified', count: 31 },
                { key: 'rejected', label: 'Rejected', count: 3 },
              ]}
              activeChip="all"
              queryPlaceholder="Search students..."
            />
          </div>

          <div className="space-y-3">
            <p className="font-medium text-foreground">DataTableShell — table + mobile card fallback</p>
            <Code>{`import { DataTableShell } from '@/components/ui/data-table-shell'`}</Code>
            <DataTableShellDemo />
            <DataTableShell columns={[{ key: 'name', header: 'Name' }]} rows={[]} emptyLabel="No students found." />
            <DataTableShell columns={[{ key: 'name', header: 'Name' }]} rows={[]} loading />
          </div>
        </div>
      </Section>

      <DesignLayoutPrimitives />

      <div className="border-t border-border/40" />

      {/* ── Compositions ── */}
      <CompositionExamples />
    </>
  );
}
