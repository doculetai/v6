'use client';

import { Shield, ShieldSlash } from '@/components/icons';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authPrimitives, feedbackPrimitives } from '@/config/copy/primitives';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { cn } from '@/lib/utils';

const mfa = authPrimitives.mfa;

function qrSvgToDataUrl(svg: string): string {
  // base64 is more reliable than percent-encoding for SVG data URLs across browsers
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${b64}`;
}

export function MFASettingsCard() {
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);
  const [enrollState, setEnrollState] = useState<{
    factorId: string;
    qrSvg: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const loadFactors = useCallback(async () => {
    const { data } = await supabaseBrowserClient.auth.mfa.listFactors();
    const totp = data?.totp ?? [];
    setFactors(totp);
  }, []);

  useEffect(() => {
    void loadFactors().finally(() => setLoading(false));
  }, [loadFactors]);

  const handleStartEnroll = async () => {
    setEnrolling(true);
    setVerifyError(null);
    setVerifyCode('');
    setEnrollState(null);

    const { data, error } = await supabaseBrowserClient.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator app',
    });

    if (error) {
      toast.error(mfa.enrollError);
      setEnrolling(false);
      return;
    }

    const qr = data?.totp?.qr_code;
    if (!qr || !data?.id) {
      toast.error(mfa.enrollError);
      setEnrolling(false);
      return;
    }

    setEnrollState({ factorId: data.id, qrSvg: qr });
    setEnrolling(false);
  };

  const handleVerifyAndEnroll = async () => {
    if (!enrollState || !verifyCode.trim()) return;
    setVerifyError(null);

    const { data: challengeData, error: challengeErr } =
      await supabaseBrowserClient.auth.mfa.challenge({ factorId: enrollState.factorId });
    if (challengeErr) {
      setVerifyError(mfa.invalidCode);
      return;
    }

    const { error: verifyErr } = await supabaseBrowserClient.auth.mfa.verify({
      factorId: enrollState.factorId,
      challengeId: challengeData.id,
      code: verifyCode.trim(),
    });

    if (verifyErr) {
      setVerifyError(mfa.invalidCode);
      return;
    }

    toast.success(mfa.enrollSuccess);
    setEnrollState(null);
    setVerifyCode('');
    void loadFactors();
  };

  const handleCancelEnroll = () => {
    setEnrollState(null);
    setVerifyCode('');
    setVerifyError(null);
  };

  const handleUnenroll = async (factorId: string) => {
    setUnenrolling(factorId);
    const { error } = await supabaseBrowserClient.auth.mfa.unenroll({ factorId });
    setUnenrolling(null);
    if (error) {
      toast.error(mfa.unenrollError);
      return;
    }
    toast.success(mfa.unenrollSuccess);
    void loadFactors();
  };

  const hasMfa = factors.length > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{mfa.title}</CardTitle>
          <CardDescription>{mfa.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feedbackPrimitives.loading.default}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasMfa ? (
            <Shield weight="duotone" className="size-5 text-primary" aria-hidden />
          ) : (
            <ShieldSlash weight="duotone" className="size-5 text-muted-foreground" aria-hidden />
          )}
          {mfa.title}
        </CardTitle>
        <CardDescription>{mfa.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasMfa && !enrollState ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{mfa.enabled}</p>
            <Button
              variant="outline"
              onClick={() => handleUnenroll(factors[0]!.id)}
              disabled={!!unenrolling}
            >
              {mfa.disable}
            </Button>
          </div>
        ) : enrollState ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{mfa.scanQR}</p>
            <div className="flex justify-center" aria-hidden>
              <img
                src={qrSvgToDataUrl(enrollState.qrSvg)}
                alt=""
                width={200}
                height={200}
                className="rounded border border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">{mfa.enterCode}</p>
            <div className="space-y-2">
              <Label htmlFor="mfa-verify-code">{mfa.verifyCode}</Label>
              <Input
                id="mfa-verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={mfa.codeInputPlaceholder}
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className={cn(verifyError && 'border-destructive')}
                aria-invalid={!!verifyError}
                aria-describedby={verifyError ? 'mfa-verify-error' : undefined}
              />
              {verifyError && (
                <p id="mfa-verify-error" className="text-sm text-destructive">
                  {verifyError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerifyAndEnroll} disabled={verifyCode.length !== 6}>
                {mfa.verifyButton}
              </Button>
              <Button variant="outline" onClick={handleCancelEnroll}>
                {mfa.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">{mfa.disabled}</p>
            <Button onClick={handleStartEnroll} disabled={enrolling}>
              {enrolling ? '…' : mfa.enable}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
