import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import type { SubscriptionPlanDTO } from "@/openapi";
import type { ReactNode } from "react";

function Card(props: { label: string; children: ReactNode }) {
  return (
    <section className="border-border bg-card flex flex-col rounded-2xl border p-8">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
        {props.label}
      </p>
      {props.children}
    </section>
  );
}

function Points(props: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {props.items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Icon name="check" className="text-primary mt-0.5 size-5 shrink-0" />
          <span className="text-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CardButton(props: { children: ReactNode }) {
  return (
    <Link
      href="/billing"
      className="bg-primary text-primary-foreground hover:bg-primary/85 mt-8 inline-flex w-fit items-center gap-1 rounded-full py-2.5 pr-4 pl-5 font-medium transition-colors"
    >
      {props.children}
      <Icon name="chevron-right" className="size-4" />
    </Link>
  );
}

// Two options and nothing else. Paying happens on the Billing page, so there is
// one checkout to keep correct. The fee line and footnote keep this page in step
// with the Terms and Refund Policy.
export function AdoPricing(props: { plans: SubscriptionPlanDTO[] }) {
  const plans = props.plans.filter((p) => p.plan.enabled);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Pricing</h1>
      <p className="text-foreground/80 mt-3 text-lg">
        Top up credits or subscribe.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card label="Top-up credits">
          <p className="mt-4 text-4xl font-bold tracking-tight">From $1</p>
          <Points
            items={[
              "Credits never expire",
              "Use them on any model",
              "Top-ups under $5 have a $0.50 fee",
            ]}
          />
          <CardButton>Top up credits</CardButton>
        </Card>

        <Card label="Subscriptions">
          {plans.length > 0 ? (
            <>
              <ul className="divide-border mt-4 divide-y">
                {plans.map((p) => (
                  <li
                    key={p.plan.id}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span>
                      <span className="font-semibold">{p.plan.title}</span>
                      {p.plan.subtitle && (
                        <span className="text-muted-foreground block text-sm">
                          {p.plan.subtitle}
                        </span>
                      )}
                    </span>
                    <span className="text-xl font-bold tabular-nums">
                      ${p.plan.price_amount}
                    </span>
                  </li>
                ))}
              </ul>
              <CardButton>Subscribe</CardButton>
            </>
          ) : (
            <>
              <p className="mt-4 text-4xl font-bold tracking-tight">
                Coming soon
              </p>
              <p className="text-foreground/80 mt-6">
                Plans with credit included every week.
              </p>
            </>
          )}
        </Card>
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        Each model&apos;s price is on the{" "}
        <Link href="/models" className="text-primary hover:underline">
          Models page
        </Link>
        . Tax is added at checkout where it applies. See the{" "}
        <Link href="/refund" className="text-primary hover:underline">
          Refund Policy
        </Link>
        .
      </p>
    </main>
  );
}
