'use client';

import { useEffect, useRef, useCallback } from 'react';

const CHANNEL_NAME = 'doculet-auth';
type AuthMessage = { type: 'logout' };

/**
 * Coordinates auth state across browser tabs via BroadcastChannel.
 * When one tab logs out, all other tabs are notified and redirect to login.
 */
export function useMultiTabAuth(onLogout: () => void) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  const broadcastLogout = useCallback(() => {
    channelRef.current?.postMessage({ type: 'logout' } satisfies AuthMessage);
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<AuthMessage>) => {
      if (event.data.type === 'logout') {
        onLogout();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [onLogout]);

  return { broadcastLogout };
}
