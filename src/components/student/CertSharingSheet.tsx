'use client';

import { useState, type FormEvent } from 'react';

import {
  Copy,
  DownloadSimple,
  Envelope,
  PaperPlaneRight,
  WhatsappLogo,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

interface CertSharingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationUrl: string;
  downloadUrl: string;
  certId: string;
}

type SendStage = 'idle' | 'form' | 'sending' | 'success' | 'error';

export function CertSharingSheet({
  open,
  onOpenChange,
  verificationUrl,
  downloadUrl,
  certId,
}: CertSharingSheetProps) {
  const copy = studentCopy.proof.certSharing;
  const [isCopied, setIsCopied] = useState(false);
  const [sendStage, setSendStage] = useState<SendStage>('idle');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const trackShare = trpc.student.trackCertificateShare.useMutation();

  const handleWhatsApp = () => {
    const message = studentCopy.proof.share.whatsappMessage.replace(
      '{url}',
      verificationUrl,
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    trackShare.mutate({ certificateId: certId, method: 'whatsapp' });
  };

  const handleCopyLink = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(verificationUrl).then(() => {
      setIsCopied(true);
      trackShare.mutate({ certificateId: certId, method: 'link' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
    trackShare.mutate({ certificateId: certId, method: 'download' });
  };

  const handleSendToggle = () => {
    setSendStage((prev) => (prev === 'idle' ? 'form' : 'idle'));
    setSendFeedback(null);
    setInstitutionEmail('');
  };

  const handleSendSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!institutionEmail.trim()) return;

    setSendStage('sending');
    setSendFeedback(null);

    const subject = encodeURIComponent(studentCopy.proof.share.emailSubject);
    const body = encodeURIComponent(
      studentCopy.proof.share.emailBody.replace('{url}', verificationUrl),
    );
    window.open(
      `mailto:${institutionEmail}?subject=${subject}&body=${body}`,
      '_blank',
    );

    trackShare.mutate(
      { certificateId: certId, method: 'email', recipient: institutionEmail },
      {
        onSuccess: () => {
          setSendFeedback(copy.sendSuccess.replace('{email}', institutionEmail));
          setSendStage('success');
          setInstitutionEmail('');
        },
        onError: () => {
          setSendFeedback(copy.sendError);
          setSendStage('error');
        },
      },
    );
  };

  const showInstitutionForm = sendStage === 'form' || sendStage === 'sending';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.verificationLinkLabel}</SheetDescription>
        </SheetHeader>

        <div className="space-y-2 pb-6">
          {/* WhatsApp — primary on mobile */}
          <ShareRow
            icon={
              <WhatsappLogo
                weight="duotone"
                className="size-5 text-success"
                aria-hidden="true"
              />
            }
            label={copy.whatsapp}
            onClick={handleWhatsApp}
          />

          {/* Copy verification link */}
          <ShareRow
            icon={
              <Copy
                weight="duotone"
                className="size-5 text-foreground"
                aria-hidden="true"
              />
            }
            label={isCopied ? copy.copied : copy.copyLink}
            onClick={handleCopyLink}
            highlighted={isCopied}
          />

          {/* Download PDF */}
          <ShareRow
            icon={
              <DownloadSimple
                weight="duotone"
                className="size-5 text-foreground"
                aria-hidden="true"
              />
            }
            label={copy.downloadPdf}
            onClick={handleDownload}
          />

          {/* Send to institution */}
          <ShareRow
            icon={
              <PaperPlaneRight
                weight="duotone"
                className="size-5 text-foreground"
                aria-hidden="true"
              />
            }
            label={copy.sendToInstitution}
            onClick={handleSendToggle}
            trailingIcon={
              <Envelope
                weight="duotone"
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            }
          />

          {showInstitutionForm ? (
            <form
              onSubmit={handleSendSubmit}
              className="rounded-xl border border-border bg-muted p-4 space-y-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor="institution-email">{copy.institutionEmailLabel}</Label>
                <Input
                  id="institution-email"
                  type="email"
                  value={institutionEmail}
                  onChange={(e) => setInstitutionEmail(e.target.value)}
                  placeholder={copy.institutionEmailPlaceholder}
                  required
                  autoFocus
                  className="min-h-11"
                />
              </div>
              <Button
                type="submit"
                className="min-h-11 w-full"
                disabled={sendStage === 'sending' || !institutionEmail.trim()}
              >
                {sendStage === 'sending' ? copy.sendingCta : copy.sendCta}
              </Button>
            </form>
          ) : null}

          {sendStage === 'success' && sendFeedback ? (
            <p className="px-1 text-sm text-success">{sendFeedback}</p>
          ) : null}

          {sendStage === 'error' && sendFeedback ? (
            <p className="px-1 text-sm text-destructive">{sendFeedback}</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  ShareRow                                                           */
/* ------------------------------------------------------------------ */

interface ShareRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlighted?: boolean;
  trailingIcon?: React.ReactNode;
}

function ShareRow({
  icon,
  label,
  onClick,
  highlighted = false,
  trailingIcon,
}: ShareRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-border px-4 py-3',
        'text-left text-sm font-medium transition-colors duration-150',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        highlighted ? 'bg-accent text-accent-foreground' : 'bg-background text-foreground',
      ].join(' ')}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {trailingIcon ?? null}
    </button>
  );
}
