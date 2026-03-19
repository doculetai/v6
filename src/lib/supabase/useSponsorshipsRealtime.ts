'use client';

import { useEffect } from 'react';

import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { trpc } from '@/trpc/client';

/** Subscribe to sponsorships changes. Invalidates student/sponsor queries on update. */
export function useSponsorshipsRealtime(userId: string | null) {
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!userId) return;

    const channel = supabaseBrowserClient
      .channel('sponsorships-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sponsorships',
          filter: `student_id=eq.${userId}`,
        },
        () => {
          void utils.student.listSponsorInvites.invalidate();
          void utils.student.getProofCertificate.invalidate();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sponsorships',
          filter: `sponsor_id=eq.${userId}`,
        },
        () => {
          void utils.sponsor.getSponsorOverview.invalidate();
          void utils.sponsor.listSponsoredStudents.invalidate();
        },
      )
      .subscribe();

    return () => {
      void supabaseBrowserClient.removeChannel(channel);
    };
  }, [userId, utils]);
}
