import { Fingerprint, Landmark, ScanEye, Lock } from "lucide-react";
import { Shield } from "lucide-react";
import { landingCopy as copy } from "@/config/copy/test-landing";
import { Reveal } from "./_shared";

const securityIcons = [Fingerprint, Landmark, ScanEye, Lock];

export function Security() {
  return (
    <section
      id="security"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          {/* Left — heading + trust shield */}
          <Reveal>
            <div className="md:sticky md:top-32">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {copy.security.headline}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                {copy.security.subtitle}
              </p>

              {/* Trust shield card */}
              <div className="mt-10 hidden rounded-2xl border border-border bg-muted/30 p-6 md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {copy.trustShield.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {copy.trustShield.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  {copy.trustShield.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    {copy.security.regulatory}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — guarantee cards */}
          <div className="space-y-4">
            {copy.security.items.map((item, i) => {
              const Icon = securityIcons[i];
              return (
                <Reveal key={item.label} delay={i * 100}>
                  <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-accent/30 hover:bg-muted/30 md:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
