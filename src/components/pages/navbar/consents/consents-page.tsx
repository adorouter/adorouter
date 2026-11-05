"use client";

import { OwnPurposeObjectionToggle } from "@/components/elements/model/own-purpose-objection-toggle";
import { ProviderConsentDialog } from "@/components/elements/model/provider-consent-panel";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/config/icon-map";
import { msg } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { ModelFocus } from "./model-focus";
import { ModelView } from "./model-view";
import { ProviderView } from "./provider-view";

const TABS = ["providers", "models"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL = {
  providers: msg("CONSENT.TAB_PROVIDERS"),
  models: msg("CONSENT.TAB_MODELS"),
} satisfies Record<Tab, ReturnType<typeof msg>>;

const TAB_ICON: Record<Tab, IconName> = {
  providers: "server",
  models: "layout-grid",
};

// The gateway's refusal links to /consents?model=<name>, which lands on that
// model's missing providers; the provider dialog lives in the URL too.
const PARSERS = {
  tab: parseAsStringLiteral(TABS).withDefault("providers"),
  // AdoRouter: cards by default; the table stays one click away.
  view: parseAsStringLiteral(["table", "list"] as const).withDefault("list"),
  model: parseAsString,
  alias: parseAsString,
};

export function ConsentsPage() {
  const t = useTranslations();
  const [params, setParams] = useQueryStates(PARSERS);

  function close() {
    void setParams({ alias: null });
  }

  return (
    <div className="mx-auto w-full max-w-6xl pt-28 pb-16">
      <div className="mb-8 space-y-6 px-4 md:px-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("CONSENT.PAGE_TITLE")}
          </h1>
          <p className="text-foreground/80 mt-3 max-w-3xl text-lg">
            {t("CONSENT.PAGE_INTRO")}
          </p>
        </div>
        <div className="border-border bg-card space-y-3 rounded-2xl border p-6">
          <h2 className="text-foreground text-lg font-semibold">
            {t("OWN_PURPOSE.TITLE")}
          </h2>
          <OwnPurposeObjectionToggle />
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = params.tab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => void setParams({ tab, model: null })}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground/80 hover:border-foreground/40",
                )}
              >
                <Icon name={TAB_ICON[tab]} className="h-4 w-4" />
                {t(TAB_LABEL[tab])}
              </button>
            );
          })}
        </div>
      </div>

      {params.model !== null ? (
        <ModelFocus
          model={params.model}
          view={params.view}
          onClear={() => void setParams({ model: null })}
          onOpenAlias={(alias) => void setParams({ alias })}
        />
      ) : params.tab === "providers" ? (
        <ProviderView
          view={params.view}
          onViewChange={(view) => void setParams({ view })}
          onOpen={(alias) => void setParams({ alias, model: null })}
        />
      ) : (
        <ModelView
          view={params.view}
          onViewChange={(view) => void setParams({ view })}
          onOpen={(model) =>
            void setParams({ model, tab: "providers", alias: null })
          }
        />
      )}

      <ProviderConsentDialog
        open={params.alias !== null}
        aliases={params.alias === null ? undefined : [params.alias]}
        onClose={close}
      />
    </div>
  );
}
