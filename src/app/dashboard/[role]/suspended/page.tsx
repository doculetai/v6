import { ShieldWarning } from '@/components/icons';
import { studentCopy } from '@/config/copy/student';

export const metadata = {
  title: 'Account suspended — Doculet',
};

export default function SuspendedPage() {
  const copy = studentCopy.suspended;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldWarning size={32} weight="duotone" className="text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">{copy.heading}</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">{copy.body}</p>
      <a
        href={`mailto:${copy.supportEmail}`}
        className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {copy.supportCta}
      </a>
    </div>
  );
}
