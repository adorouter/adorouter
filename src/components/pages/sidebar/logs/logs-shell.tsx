"use client";

import { PageContent } from "@/components/layout/sidebar/sidebar-layout";
import { useTranslations } from "next-intl";
import { UsageLogs } from "./common/usage-logs";

// adorouter serves text models only, so there are no drawing or task logs to show.
export function LogsShell() {
  const t = useTranslations();

  return (
    <PageContent>
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {t("LOGS.TITLE")}
        </h1>
        <p className="text-foreground/70 mt-2">{t("LOGS.DESCRIPTION")}</p>
      </div>

      <UsageLogs />
    </PageContent>
  );
}
