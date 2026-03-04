import { TRPCError } from "@trpc/server"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { universityCopy } from "@/config/copy/university"
import type { PipelineRow, PipelineStats } from "@/db/queries/university-pipeline"
import { api } from "@/trpc/server"

import { PipelinePageClient } from "./pipeline-page-client"

export const metadata: Metadata = {
  title: `${universityCopy.pipeline.title} | Doculet`,
  description: universityCopy.pipeline.subtitle,
}

type Props = {
  params: Promise<{ role: string }>
}

export default async function PipelinePage({ params }: Props) {
  const { role } = await params

  if (role !== "university") {
    notFound()
  }

  let rows: PipelineRow[] = []
  let stats: PipelineStats = { total: 0, pending: 0, approvedThisWeek: 0, avgDaysWaiting: 0 }

  try {
    const caller = await api()
    const result = await caller.university.getPipelineQueue()
    rows = result.rows
    stats = result.stats
  } catch (error) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/login")
    }
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      redirect("/dashboard/university")
    }
    throw error
  }

  return <PipelinePageClient initialRows={rows} initialStats={stats} />
}
