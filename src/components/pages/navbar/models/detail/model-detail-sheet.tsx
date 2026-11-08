"use client";

import {
  deriveOutputModality,
  EMPTY_METADATA,
  fmtUnit,
  inputPriceUnit,
  modelPriceColumns,
  outputPriceUnit,
} from "@/lib/api/model-modality";
import { VendorIcon } from "@/components/elements/brand/vendor-icon";
import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/elements/code/copy-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { modelHref } from "@/lib/utils/base";
import { chooseChatModelAtom } from "@/store/chat-store";
import { useSetAtom } from "jotai";
import {
  gridPriceParts,
  gridPricingColumns,
  type EndpointInfo,
  GridPricingRow,
} from "@/lib/api/pricing";
import { useModelWatch } from "@/hooks/models/notify-hook";
import {
  useModelDetailQuery,
  useModelGroupsQuery,
} from "@/hooks/models/pricing-hook";
import { env } from "@/lib/config/env";
import { getVendorTheme } from "@/lib/config/vendor-registry";
import { cn } from "@/lib/utils";
import {
  bestDiscountPercent,
  formatPct,
  formatPrice,
  formatTokenCount,
} from "@/lib/utils/format/number";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  listPrice,
  rateTone,
  Stat,
} from "@/components/pages/navbar/models/browse/model-grid-card";
import { MINI_TABLE, MINI_TABLE_BODY_ROW } from "./shared/mini-table";
import { PriceRows } from "./pricing/price-rows";
import { GroupPricingSection } from "./pricing/group-pricing-section";
import { ModelDescription } from "./header/model-description";
import { hasAnyParameter } from "./header/capability-helpers";
import { ModelHeaderChips, ModelMetaStats } from "./header/model-header-chips";
import { PerformanceSection } from "./tabs/performance-section";
import { UptimeSection } from "./tabs/uptime-section";
import { SupportedParameters } from "./tabs/supported-parameters";

type ModelDetailSheetProps = {
  model: { model_name: string } | null;
  endpointMap: Record<string, EndpointInfo>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PANEL_LABEL =
  "text-muted-foreground font-mono text-[11px] tracking-widest uppercase";

// AdoRouter: one bordered card per section with a mono label, the look of the
// model cards and the account menu, in place of upstream's headed list.
function PanelCard(props: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border-border rounded-2xl border p-4", props.className)}
    >
      <p className={PANEL_LABEL}>{props.label}</p>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

function WatchButton(props: { modelName: string }) {
  const t = useTranslations();
  const watch = useModelWatch(props.modelName);

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        "rounded-full",
        watch.watched && "border-primary/40 text-primary",
      )}
      onClick={() => watch.toggle()}
    >
      <Icon name="bell" className="mr-1.5 h-3.5 w-3.5" />
      {watch.watched ? t("NOTIFY.UNWATCH") : t("NOTIFY.WATCH")}
    </Button>
  );
}

// AdoRouter: our own layout (2026-11-08). A header with the model name large,
// the card's stat grid right under it so the price comes first, pill actions,
// then each section in its own card.
export function ModelDetailSheet(props: ModelDetailSheetProps) {
  const t = useTranslations();
  const locale = useLocale();
  const setChatModel = useSetAtom(chooseChatModelAtom);
  const detailQuery = useModelDetailQuery(props.model?.model_name ?? null);
  const detail = detailQuery.data;
  const model = detail && {
    ...detail,
    metadata: detail.metadata ?? EMPTY_METADATA,
  };
  const groupsQuery = useModelGroupsQuery(props.model?.model_name ?? null);

  if (!model) return null;

  const theme = getVendorTheme(model.vendor);
  const modality = deriveOutputModality(model);
  const price = modelPriceColumns(model);
  const inUnit = inputPriceUnit(modality, model.is_fixed_price);
  const outUnit = outputPriceUnit(modality, model.is_fixed_price);
  const ctx = model.metadata.contextWindow ?? model.metadata.maxInputTokens;
  const discount = bestDiscountPercent(model);
  const uptime = model.uptime_24h ?? undefined;

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-xl">
        <SheetHeader className="gap-4 px-5 pt-6 pb-0">
          <div className="text-muted-foreground flex items-center gap-2 pr-8 text-sm">
            <VendorIcon vendor={model.vendor} size={18} />
            <SheetDescription className="text-muted-foreground truncate">
              {model.vendor}
            </SheetDescription>
            {discount > 0 && (
              <span className="bg-primary/15 text-primary ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                {discount}% off
              </span>
            )}
          </div>
          <SheetTitle className="flex items-center gap-1 font-mono text-2xl font-semibold">
            <span className="min-w-0 truncate">{model.model_name}</span>
            <CopyButton
              text={model.model_name}
              className="text-muted-foreground hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
            />
          </SheetTitle>
          <dl className="border-border [&>div]:border-border grid grid-cols-2 rounded-2xl border sm:grid-cols-4 [&>div:not(:first-child)]:border-l max-sm:[&>div:nth-child(3)]:border-l-0 max-sm:[&>div:nth-child(n+3)]:border-t">
            <Stat
              label="Input"
              value={fmtUnit(price.input, inUnit, model.is_fixed_price)}
              original={listPrice(
                price.input,
                price.originalInput,
                inUnit,
                model.is_fixed_price,
              )}
            />
            <Stat
              label="Output"
              value={fmtUnit(price.output, outUnit, model.is_fixed_price)}
              original={listPrice(
                price.output,
                price.originalOutput,
                outUnit,
                model.is_fixed_price,
              )}
            />
            <Stat
              label="Context"
              value={ctx ? formatTokenCount(ctx, locale) : undefined}
            />
            <Stat
              label="Uptime 24h"
              value={uptime !== undefined ? formatPct(uptime, 1) : undefined}
              tone={uptime !== undefined ? rateTone(uptime) : undefined}
            />
          </dl>
          <div className="flex flex-wrap gap-2">
            {model.chat && (
              <Button
                size="sm"
                className="rounded-full"
                nativeButton={false}
                onClick={() => {
                  setChatModel(model.model_name);
                }}
                render={<Link href="/chat" />}
              >
                <Icon name="message-circle" className="mr-1.5 h-3.5 w-3.5" />
                {t("MODELS.OPEN_IN_CHAT")}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              nativeButton={false}
              render={<Link href={modelHref(model.model_name, model.vendor)} />}
            >
              <Icon name="external-link" className="mr-1.5 h-3.5 w-3.5" />
              {t("MODELS.VIEW_DETAILS")}
            </Button>
            <WatchButton modelName={model.model_name} />
          </div>
        </SheetHeader>

        <div className="space-y-3 px-5 pt-5 pb-6">
          <PanelCard label={t("MODELS.DETAIL.DESCRIPTION")}>
            {model.description && <ModelDescription text={model.description} />}
            <div className={cn(model.description && "mt-4")}>
              <ModelHeaderChips metadata={model.metadata} locale={locale} />
            </div>
            <ModelMetaStats metadata={model.metadata} />
          </PanelCard>

          <PanelCard label={t("MODELS.DETAIL.PRICING")}>
            <PriceRows model={model} theme={theme} />
            {model.enable_groups.length > 0 && !model.is_tiered && (
              <GroupPricingSection
                model={model}
                groupRatioMap={groupsQuery.data?.group_ratio ?? {}}
                autoGroups={groupsQuery.data?.auto_chain ?? []}
                groupProviders={groupsQuery.data?.group_providers ?? {}}
                theme={theme}
              />
            )}
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {t("MODELS.PRICE.VARIES_TOOLTIP")}
            </p>
          </PanelCard>

          {model.grid_pricing && (
            <GridPricingSection
              gridPricing={model.grid_pricing}
              priceMultiplier={model.grid_min_ratio}
              theme={theme}
            />
          )}

          <PanelCard label={t("MODELS.DETAIL.UPTIME")}>
            <UptimeSection model={model.model_name} />
          </PanelCard>

          <PanelCard label={t("MODELS.DETAIL.PERFORMANCE")}>
            <PerformanceSection modelName={model.model_name} />
          </PanelCard>

          {hasAnyParameter(model.metadata) && (
            <PanelCard label={t("MODELS.DETAIL.SUPPORTED_PARAMETERS")}>
              <SupportedParameters metadata={model.metadata} />
            </PanelCard>
          )}

          {model.supported_endpoint_types.length > 0 && (
            <PanelCard label={t("MODELS.DETAIL.ENDPOINTS")}>
              <div className="space-y-2">
                {model.supported_endpoint_types.map((endpoint) => {
                  const info = props.endpointMap[endpoint];
                  let path = info?.path ?? "";
                  if (path.includes("{model}")) {
                    path = path.replaceAll("{model}", model.model_name);
                  }
                  const method = info?.method ?? "POST";
                  const apiBase = env.apiUrl ?? "";
                  const fullUrl = path ? `${apiBase}${path}` : "";

                  return (
                    <div
                      key={endpoint}
                      className="bg-muted/30 rounded-xl px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="font-mono text-xs">{endpoint}</span>
                        </div>
                        {path && (
                          <span className="text-muted-foreground font-mono text-[10px] uppercase">
                            {method}
                          </span>
                        )}
                      </div>
                      {fullUrl && (
                        <div className="mt-1.5 flex items-start gap-1.5 pl-3.5">
                          <p className="text-muted-foreground font-mono text-[11px] break-all">
                            {fullUrl}
                          </p>
                          <CopyButton text={fullUrl} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </PanelCard>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GridPricingTable(props: {
  rows: GridPricingRow[];
  priceMultiplier?: number;
  theme: ReturnType<typeof getVendorTheme>;
  pricingLabel: string;
}) {
  const columns = gridPricingColumns(props.rows);

  return (
    <div className="overflow-x-auto">
      <table className={MINI_TABLE}>
        <thead>
          <tr className="border-border/40 border-b">
            {columns.map((col) => (
              <th
                key={col}
                className="text-foreground px-2 py-1.5 text-left text-[10px] font-normal uppercase"
              >
                {col}
              </th>
            ))}
            <th className="text-foreground px-2 py-1.5 text-right text-[10px] font-normal uppercase">
              {props.pricingLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, i) => {
            const { price, suffix } = gridPriceParts(
              row,
              props.priceMultiplier,
            );
            return (
              <tr key={i} className={MINI_TABLE_BODY_ROW}>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="text-muted-foreground px-2 py-1.5 text-[11px]"
                  >
                    {String(row[col] ?? "")}
                  </td>
                ))}
                <td
                  className={cn(
                    "px-2 py-1.5 text-right text-[11px] font-medium",
                    props.theme.text,
                  )}
                >
                  {formatPrice(price)}
                  {suffix && (
                    <span className="text-muted-foreground ml-0.5 text-[10px]">
                      {suffix}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GridPricingSection(props: {
  gridPricing: GridPricingRow[];
  priceMultiplier?: number;
  theme: ReturnType<typeof getVendorTheme>;
}) {
  const t = useTranslations();

  return (
    <PanelCard label={t("MODELS.DETAIL.GRID_PRICING")}>
      <div>
        <GridPricingTable
          rows={props.gridPricing}
          priceMultiplier={props.priceMultiplier}
          theme={props.theme}
          pricingLabel={t("MODELS.DETAIL.PRICING")}
        />
      </div>
    </PanelCard>
  );
}
