"use client";

import { AdoStandalone } from "@/components/pages/ado/ado-parts";
import { Icon } from "@/components/ui/icon";
import { useTranslations } from "next-intl";

export function OfflineFallback() {
  const t = useTranslations();

  return (
    <AdoStandalone
      title={t("MAIN.OFFLINE.TITLE")}
      description={t("MAIN.OFFLINE.DESCRIPTION")}
    >
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-primary text-primary-foreground hover:bg-primary/85 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors"
      >
        <Icon name="refresh-cw" className="h-4 w-4" />
        {t("MAIN.ACTIONS.TRY_AGAIN")}
      </button>
      {/* A plain element by id: the inline script on the offline page wires
          it, so it works while no chunk can load and React never hydrates. */}
      <button
        id="uno-repair"
        type="button"
        className="border-border hover:border-foreground/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold transition-colors"
      >
        {t("MAIN.ACTIONS.REPAIR")}
      </button>
    </AdoStandalone>
  );
}
