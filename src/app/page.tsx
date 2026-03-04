import Link from 'next/link';

export const metadata = {
  title: 'Doculet.ai — Proof of Funds Verification',
};

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">doculet.ai</h1>
        <p className="text-muted-foreground text-lg">Proof of Funds Verification Platform</p>
        <p className="text-sm text-muted-foreground">V6 — Building</p>
        <Link
          href="/dashboard/student"
          className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Open Dashboard →
        </Link>
      </div>
    </div>
  );
}
