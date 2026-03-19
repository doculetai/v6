'use client';

import { useEffect } from 'react';

import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { trpc } from '@/trpc/client';

export function useDocumentsRealtime(userId: string) {
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!userId) return;

    const channel = supabaseBrowserClient
      .channel('documents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void utils.student.listDocuments.invalidate();
        },
      )
      .subscribe();

    return () => {
      void supabaseBrowserClient.removeChannel(channel);
    };
  }, [userId, utils]);
}
