import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function SponsorKycLoading() {
  return (
    <div className="space-y-6" aria-label={sponsorCopy.kyc.loading.title}>
      <Card className="border-border/70 bg-card/85 shadow-md dark:border-border dark:bg-card/80">
        <CardHeader className="space-y-3">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-md dark:border-border dark:bg-card/80">
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/85 shadow-md dark:border-border dark:bg-card/80">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-md dark:border-border dark:bg-card/80">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/85 shadow-md dark:border-border dark:bg-card/80">
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
