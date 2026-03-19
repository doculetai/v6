'use client';

import { useCallback, useRef, useState } from 'react';

type PaystackPopupOptions = {
  publicKey: string;
  email: string;
  amountKobo: number;
  reference: string;
  currency?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v2/inline.js';

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${PAYSTACK_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Paystack')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.head.appendChild(script);
  });
}

export function usePaystackPopup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSuccessRef = useRef<((ref: string) => void) | null>(null);
  const onCloseRef = useRef<(() => void) | null>(null);

  const open = useCallback(async (options: PaystackPopupOptions) => {
    onSuccessRef.current = options.onSuccess;
    onCloseRef.current = options.onClose ?? null;
    setIsLoading(true);
    setError(null);

    try {
      await loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error('Paystack not available');
      }

      const handler = window.PaystackPop.setup({
        key: options.publicKey,
        email: options.email,
        amount: options.amountKobo,
        ref: options.reference,
        currency: options.currency ?? 'NGN',
        callback: (response: { reference: string }) => {
          onSuccessRef.current?.(response.reference);
        },
        onClose: () => {
          onCloseRef.current?.();
        },
      });

      handler.openIframe();
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError('Unable to open payment window');
    }
  }, []);

  return { open, isLoading, error };
}
