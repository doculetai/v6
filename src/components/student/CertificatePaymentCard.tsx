'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Warning } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';
import { FxRateInline } from '@/components/ui/fx-rate-inline';
import { usePaystackPopup } from '@/lib/hooks/usePaystackPopup';
import { trpc } from '@/trpc/client';

type CertificatePaymentCardProps = {
  certificateId: string;
  paymentStatus: 'unpaid' | 'paid' | 'waived';
  paidAt: string | null;
  fxRate?: { rateNgnPerUsd: number; updatedAt: Date };
};

export function CertificatePaymentCard({
  certificateId,
  paymentStatus: initialPaymentStatus,
  paidAt: initialPaidAt,
  fxRate,
}: CertificatePaymentCardProps) {
  const copy = studentCopy.proof.payment;
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [paidAt, setPaidAt] = useState(initialPaidAt);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const paystack = usePaystackPopup();
  const utils = trpc.useUtils();

  const initMutation = trpc.student.initializeCertificatePayment.useMutation();
  const confirmMutation = trpc.student.confirmCertificatePayment.useMutation({
    onSuccess: () => {
      setPaymentStatus('paid');
      setPaidAt(new Date().toISOString());
      setFeedback({ kind: 'success', message: copy.successMessage });
      void utils.student.getProofCertificate.invalidate();
    },
    onError: () => {
      setFeedback({ kind: 'error', message: copy.errorMessage });
    },
  });

  const handlePay = async () => {
    setFeedback(null);

    try {
      const paymentConfig = await initMutation.mutateAsync({ certificateId });

      await paystack.open({
        publicKey: paymentConfig.paystackPublicKey,
        email: paymentConfig.email,
        amountKobo: paymentConfig.amountKobo,
        reference: paymentConfig.reference,
        currency: paymentConfig.currency,
        onSuccess: (reference: string) => {
          confirmMutation.mutate({ reference });
        },
      });
    } catch {
      setFeedback({ kind: 'error', message: copy.errorMessage });
    }
  };

  if (paymentStatus === 'paid' || paymentStatus === 'waived') {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="flex items-center gap-3 pt-5">
          <CheckCircle weight="duotone" className="size-5 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-success">
              {paymentStatus === 'waived' ? copy.waived : copy.alreadyPaid}
            </p>
            {paidAt ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {`${copy.paidAtLabel}: ${new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(paidAt))}`}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isBusy = initMutation.isPending || confirmMutation.isPending || paystack.isLoading;

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-card-foreground">
          <CreditCard weight="duotone" className="size-5" aria-hidden="true" />
          <CardTitle className="text-lg md:text-xl">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted p-3">
          <p className="text-xs text-muted-foreground">{copy.amountLabel}</p>
          <p className="mt-0.5 font-mono text-xl font-semibold text-foreground">
            {`${copy.currency} ${copy.firstIssueFee}`}
          </p>
          {fxRate ? (
            <div className="mt-1">
              <FxRateInline
                rateNgnPerUsd={fxRate.rateNgnPerUsd}
                updatedAt={fxRate.updatedAt}
              />
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          className="min-h-11 w-full"
          onClick={() => void handlePay()}
          disabled={isBusy}
        >
          {isBusy ? copy.payingCta : copy.payCta}
        </Button>

        {feedback?.kind === 'success' ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
            <CheckCircle weight="duotone" className="size-4 text-success" aria-hidden="true" />
            <p className="text-sm text-success">{feedback.message}</p>
          </div>
        ) : null}

        {/* B3.4: payment failure inline error using Callout */}
        {(feedback?.kind === 'error' || paystack.error) ? (
          <Callout variant="error">
            {feedback?.message
              ? studentCopy.certPayment.failure(feedback.message)
              : paystack.error
                ? studentCopy.certPayment.failure(paystack.error)
                : studentCopy.proof.payment.errorMessage}
          </Callout>
        ) : null}
      </CardContent>
    </Card>
  );
}
