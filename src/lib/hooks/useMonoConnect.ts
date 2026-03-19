'use client';

import { useCallback, useRef, useState } from 'react';

type MonoConnectOptions = {
  publicKey: string;
  onSuccess: (code: string) => void;
  onClose?: () => void;
};

type MonoConnectState = {
  isLoading: boolean;
  error: string | null;
};

declare global {
  interface Window {
    Connect?: new (config: {
      key: string;
      onSuccess: (data: { code: string }) => void;
      onClose?: () => void;
    }) => { setup: () => void; open: () => void };
  }
}

const MONO_CONNECT_SCRIPT_URL = 'https://connect.mono.co/connect.js';

function loadMonoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Connect) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${MONO_CONNECT_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Mono Connect')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = MONO_CONNECT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Mono Connect'));
    document.head.appendChild(script);
  });
}

export function useMonoConnect({
  publicKey,
  onSuccess,
  onClose,
}: MonoConnectOptions) {
  const [state, setState] = useState<MonoConnectState>({
    isLoading: false,
    error: null,
  });

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const open = useCallback(async () => {
    if (!publicKey) {
      setState({ isLoading: false, error: 'Mono public key not configured' });
      return;
    }

    setState({ isLoading: true, error: null });

    try {
      await loadMonoScript();

      if (!window.Connect) {
        throw new Error('Mono Connect not available');
      }

      const widget = new window.Connect({
        key: publicKey,
        onSuccess: (data: { code: string }) => {
          onSuccessRef.current(data.code);
        },
        onClose: () => {
          onCloseRef.current?.();
        },
      });

      widget.setup();
      widget.open();
      setState({ isLoading: false, error: null });
    } catch {
      setState({
        isLoading: false,
        error: 'Unable to open bank connection widget',
      });
    }
  }, [publicKey]);

  return { open, isLoading: state.isLoading, error: state.error };
}
