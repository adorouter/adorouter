"use client";

import { PageContent } from "@/components/layout/sidebar/sidebar-layout";
import { useTranslations } from "next-intl";
import { AccountCard } from "./account-card";
import { AccountHeader } from "./account-header";
import { BackupCard } from "./backup-card";
import { ConsentsCard } from "./consents-card";
import { CustomerTypeCard } from "./customer-type-card";
import { NotificationCard } from "./notification-card";
import { OwnPurposeObjectionCard } from "./own-purpose-objection-card";
import { SecurityCard } from "./security-card";
import { TimeoutCard } from "./timeout-card";
import { Icon } from "@/components/ui/icon";

export function SettingsPage() {
  const t = useTranslations();

  return (
    <PageContent>
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {t("SETTINGS.TITLE")}
        </h1>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="settings" className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm font-medium">
            {t("SETTINGS.ACCOUNT_INFO")}
          </span>
        </div>
        <AccountHeader />
      </div>

      <div className="mb-6">
        <CustomerTypeCard />
      </div>

      <div className="mb-6">
        <AccountCard />
      </div>

      <div className="mb-6">
        <SecurityCard />
      </div>

      <div className="mb-6">
        <NotificationCard />
      </div>

      <div className="mb-6">
        <TimeoutCard />
      </div>

      <div className="mb-6">
        <ConsentsCard />
      </div>

      <div className="mb-6">
        <OwnPurposeObjectionCard />
      </div>

      <div className="mb-6">
        <BackupCard />
      </div>
    </PageContent>
  );
}
