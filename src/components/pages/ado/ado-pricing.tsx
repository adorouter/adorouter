"use client";

import { PaymentMethodToggle } from "@/components/elements/billing/payment-method-toggle";
import { useAuthQuery } from "@/hooks/auth/auth-hook";
import { useLoginRedirect } from "@/hooks/auth/use-login-redirect";
import { useSubscriptionPlansQuery } from "@/hooks/billing/subscription-hook";
import { useBillingActions } from "@/hooks/ui/use-billing-actions";
import { useHydrated } from "@/hooks/ui/use-hydrated";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { SubscriptionPlanDTO } from "@/openapi";
import { useState } from "react";

// Bounds match the gateway's Creem handler; NowPayments shares them.
const CUSTOM_MIN = 1;
const CUSTOM_MAX = 100000;
// Card presets go through Creem's custom amount, so the gateway applies the
// same fee rule to them as to a typed amount.
const CARD_PRESETS = [5, 10, 20, 50, 100];

const PERIOD_WORD: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

function money(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function durationLabel(plan: SubscriptionPlanDTO["plan"]) {
  const unit = plan.duration_unit || "month";
  return plan.duration_value > 1 ? `${plan.duration_value} ${unit}s` : unit;
}

function SectionLabel(props: { children: string }) {
  return (
    <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
      {props.children}
    </p>
  );
}

function PlanCard(props: {
  plan: SubscriptionPlanDTO;
  featured: boolean;
  disabled: boolean;
  onSubscribe: () => void;
}) {
  const { plan } = props.plan;
  const period = PERIOD_WORD[plan.quota_reset_period];
  return (
    <div
      className={cn(
        "bg-card flex flex-col rounded-2xl border p-6",
        props.featured ? "border-primary" : "border-border",
      )}
    >
      <p className="font-semibold">{plan.title}</p>
      {plan.subtitle && (
        <p className="text-muted-foreground text-sm">{plan.subtitle}</p>
      )}
      <p className="mt-4">
        <span className="text-4xl font-bold tracking-tight tabular-nums">
          {money(plan.price_amount)}
        </span>
        <span className="text-muted-foreground"> / {durationLabel(plan)}</span>
      </p>
      {props.plan.estimated_total_usd > 0 && (
        <div className="bg-primary/10 text-primary mt-4 rounded-xl px-4 py-3">
          <span className="text-2xl font-bold tabular-nums">
            {money(props.plan.estimated_total_usd)}
          </span>{" "}
          <span className="text-sm font-medium">in credit</span>
        </div>
      )}
      {props.plan.quota_per_reset_usd > 0 && period && (
        <p className="text-foreground/80 mt-4 text-sm">
          Delivered {money(props.plan.quota_per_reset_usd)} each {period}.
          Unused credit doesn&apos;t carry over to the next {period}.
        </p>
      )}
      <button
        type="button"
        onClick={props.onSubscribe}
        disabled={props.disabled}
        className={cn(
          "mt-6 rounded-full py-2.5 font-semibold transition-colors disabled:opacity-50",
          props.featured
            ? "bg-primary text-primary-foreground hover:bg-primary/85"
            : "border-border hover:border-foreground/40 border",
        )}
      >
        Subscribe
      </button>
    </div>
  );
}

// Buys straight from the page: a guest is sent to log in and back here first.
export function AdoPricing() {
  const router = useRouter();
  const loginRedirect = useLoginRedirect();
  const authQuery = useAuthQuery();
  const hydrated = useHydrated();
  const isLoggedIn = hydrated && !!authQuery.data;
  const billing = useBillingActions();
  const plans = (useSubscriptionPlansQuery().data ?? []).filter(
    (p) => p.plan.enabled,
  );
  const topUpInfo = billing.topUpInfo;
  const [customAmount, setCustomAmount] = useState("");

  const card = billing.paymentMethod === "card" && billing.enableCreem;
  const crypto =
    billing.paymentMethod === "crypto" && billing.enableNowPayments;
  // Creem still needs a product id, even for a custom amount.
  const creemProductId =
    (topUpInfo?.creemProducts ?? [])
      .filter((p) => p.price > 0)
      .sort((a, b) => a.price - b.price)[0]?.productId ?? "";

  const presets = card
    ? CARD_PRESETS
    : crypto
      ? (topUpInfo?.amount_options ?? [])
      : [];
  const charged = (amount: number) =>
    card ? billing.creemChargedAmount(amount) : amount;

  function requireLogin() {
    if (isLoggedIn) return true;
    loginRedirect("/pricing");
    return false;
  }

  function pay(amount: number) {
    if (!requireLogin()) return;
    if (crypto) billing.payNowPayments(amount);
    else billing.payCreem(creemProductId, amount, true);
  }

  function subscribe(plan: SubscriptionPlanDTO) {
    if (!requireLogin()) return;
    billing.subscribe(plan, {
      isLoggedIn,
      onUnauthorized: () => router.push("/billing"),
    });
  }

  const parsed = Number(customAmount);
  const customValid =
    customAmount.trim() !== "" &&
    Number.isFinite(parsed) &&
    (!crypto || Number.isInteger(parsed)) &&
    parsed >= CUSTOM_MIN &&
    parsed <= CUSTOM_MAX;
  const canTopUp = (card && !!creemProductId) || crypto;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Pricing</h1>
      <p className="text-foreground/80 mt-3 text-lg">
        Top up credits or subscribe.
      </p>

      <section className="border-border bg-card mt-10 rounded-2xl border p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <SectionLabel>Top-up credits</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Add credit, use any model
            </h2>
            <p className="text-muted-foreground mt-1">
              From $1. Credits never expire.
            </p>
          </div>
          <PaymentMethodToggle />
        </div>

        {canTopUp ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {presets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => pay(amount)}
                  disabled={billing.isTopUpMutating}
                  className="border-border hover:border-primary/60 flex flex-col items-center rounded-xl border px-3 py-4 transition-colors disabled:opacity-50"
                >
                  <span className="text-xl font-bold tabular-nums">
                    {money(amount)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    pay {money(charged(amount))}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="border-border focus-within:border-foreground/50 flex items-center rounded-full border px-4 py-2">
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={CUSTOM_MIN}
                  max={CUSTOM_MAX}
                  step={crypto ? "1" : "0.01"}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Other amount"
                  aria-label="Other amount in dollars"
                  className="w-32 bg-transparent pl-1 tabular-nums outline-none"
                />
              </div>
              <button
                type="button"
                disabled={!customValid || billing.isTopUpMutating}
                onClick={() => pay(parsed)}
                className="bg-primary text-primary-foreground hover:bg-primary/85 rounded-full px-5 py-2 font-semibold transition-colors disabled:opacity-50"
              >
                {customValid ? `Pay ${money(charged(parsed))}` : "Pay"}
              </button>
            </div>

            <p className="text-muted-foreground mt-4 text-sm">
              Top-ups under $5 have a $0.50 fee. Tax is added at checkout where
              it applies.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground mt-6">
            Top-ups are not available right now.
          </p>
        )}
      </section>

      <section className="mt-12">
        <SectionLabel>Subscriptions</SectionLabel>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Credit included every period
        </h2>
        {plans.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.plan.id}
                plan={plan}
                featured={plans.length > 2 && i === 1}
                disabled={billing.isSubMutating}
                onSubscribe={() => subscribe(plan)}
              />
            ))}
          </div>
        ) : (
          <p className="border-border text-muted-foreground mt-6 rounded-2xl border border-dashed p-6">
            Subscriptions are coming soon.
          </p>
        )}
      </section>

      <p className="text-muted-foreground mt-10 text-sm">
        Each model&apos;s price is on the{" "}
        <Link href="/models" className="text-primary hover:underline">
          Models page
        </Link>
        . See the{" "}
        <Link href="/refund" className="text-primary hover:underline">
          Refund Policy
        </Link>
        .
      </p>
    </main>
  );
}
