"use client";

import { PaymentMethodToggle } from "@/components/elements/billing/payment-method-toggle";
import { SectionBoundary } from "@/components/elements/feedback/section-boundary";
import { PageContent } from "@/components/layout/sidebar/sidebar-layout";
import { Icon } from "@/components/ui/icon";
import {
  PILL_TABS_LIST,
  PILL_TABS_TRIGGER,
} from "@/components/layout/account/account-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/lib/config/env";
import { useTranslations } from "next-intl";
import { AccountStats } from "./account-stats";
import { RedeemSection } from "./redeem-section";
import { SubscriptionSection } from "./subscription-section";
import { TopUpSection } from "./topup-section";
import { TransactionsSection } from "./transactions-section";

export function Billing() {
  const t = useTranslations();

  return (
    <PageContent>
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {t("BILLING.TITLE")}
        </h1>
      </div>

      <div className="mb-6">
        <SectionBoundary>
          <AccountStats />
        </SectionBoundary>
      </div>

      <Tabs defaultValue="buy" className="mb-6">
        <TabsList className={PILL_TABS_LIST}>
          <TabsTrigger value="buy" className={PILL_TABS_TRIGGER}>
            {t("BILLING.TABS.BUY")}
          </TabsTrigger>
          <TabsTrigger value="topup-transactions" className={PILL_TABS_TRIGGER}>
            {t("BILLING.TABS.TOPUP_TRANSACTIONS")}
          </TabsTrigger>
          <TabsTrigger
            value="subscription-transactions"
            className={PILL_TABS_TRIGGER}
          >
            {t("BILLING.TABS.SUBSCRIPTION_TRANSACTIONS")}
          </TabsTrigger>
        </TabsList>

        {/* Two distinct ways to pay, so each gets its own bordered block with a
            header. Previously they ran together under one faint label and the
            payment-method toggle sat up in the balance card, nowhere near the
            tiles it switches. */}
        <TabsContent value="buy" className="space-y-4">
          <section className="border-border overflow-hidden rounded-2xl border">
            <header className="border-border flex items-center justify-between border-b px-4 py-3">
              <span className="text-muted-foreground text-sm font-medium">
                {t("BILLING.SECTIONS.SUBSCRIPTION_PLANS")}
              </span>
              <span className="text-muted-foreground/70 text-xs">
                {t("BILLING.SECTIONS.SUBSCRIPTIONS_HINT")}
              </span>
            </header>
            <div className="p-4">
              <SectionBoundary>
                <SubscriptionSection />
              </SectionBoundary>
            </div>
          </section>

          <section className="border-border overflow-hidden rounded-2xl border">
            <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-baseline gap-3">
                <span className="text-muted-foreground text-sm font-medium">
                  {t("BILLING.SECTIONS.QUOTA_TOPUP")}
                </span>
                <span className="text-muted-foreground/70 text-xs">
                  {t("BILLING.SECTIONS.QUOTA_TOPUP_HINT")}
                </span>
              </div>
              <PaymentMethodToggle compact />
            </header>
            <div className="p-4">
              <SectionBoundary>
                <TopUpSection />
              </SectionBoundary>
            </div>
          </section>

          <section className="border-border overflow-hidden rounded-2xl border">
            <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <span className="text-muted-foreground text-sm font-medium">
                {t("BILLING.SECTIONS.REDEEM")}
              </span>
              <span className="text-muted-foreground/70 text-xs">
                {t("BILLING.SECTIONS.REDEEM_HINT")}
              </span>
            </header>
            <div className="p-4">
              <SectionBoundary>
                <RedeemSection />
              </SectionBoundary>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="topup-transactions">
          <SectionBoundary>
            <TransactionsSection kind="topups" />
          </SectionBoundary>
        </TabsContent>

        <TabsContent value="subscription-transactions">
          <SectionBoundary>
            <TransactionsSection kind="orders" />
          </SectionBoundary>
        </TabsContent>
      </Tabs>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="mail" className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm font-medium">
            {t("BILLING.SUPPORT_TITLE")}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("BILLING.SUPPORT_TEXT", { supportEmail: env.supportEmail })}
        </p>
        <a
          href={`mailto:${env.supportEmail}`}
          className="text-foreground hover:text-muted-foreground mt-1 inline-block text-sm font-medium underline underline-offset-4"
        >
          {env.supportEmail}
        </a>
      </div>
    </PageContent>
  );
}
