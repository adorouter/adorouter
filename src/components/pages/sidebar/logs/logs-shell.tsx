"use client";

import { PageContent } from "@/components/layout/sidebar/sidebar-layout";
import { useTranslations } from "next-intl";
import { UsageLogs } from "./common/usage-logs";

// adorouter serves text models only, so there are no drawing or task logs to show.
export function LogsShell() {
  const t = useTranslations();

  return (
    <PageContent>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
            {t("LOGS.TITLE")}
          </span>
        </div>
        <h1 className="text-foreground mt-1 text-xl font-bold tracking-tight md:text-2xl">
          {t("LOGS.TITLE")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("LOGS.DESCRIPTION")}
        </p>
      </div>

      <UsageLogs />
    </PageContent>
  );
}
