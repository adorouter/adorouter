"use client";

import { VendorIcon } from "@/components/elements/brand/vendor-icon";
import { CopyButton } from "@/components/elements/code/copy-button";
import {
  deriveOutputModality,
  fmtUnit,
  inputPriceUnit,
  modelPriceColumns,
  outputPriceUnit,
  type PriceUnit,
} from "@/lib/api/model-modality";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { modelHref } from "@/lib/utils/base";
import {
  bestDiscountPercent,
  discountPercent,
  formatLatency,
  formatPct,
  formatTokenCount,
} from "@/lib/utils/format/number";
import type { PricingCatalogModel } from "@/openapi";
import { useLocale } from "next-intl";

// Same thresholds the old table used for uptime and success rate.
function rateTone(value: number) {
  if (value >= 99) return "text-emerald-400";
  if (value >= 90) return "text-amber-400";
  return "text-red-400";
}

const titleClass =
  "text-foreground min-w-0 truncate text-left font-mono text-lg font-semibold after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none";

function Stat(props: {
  label: string;
  value?: string;
  tone?: string;
  original?: string;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <dt className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
        {props.label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-base font-semibold tabular-nums",
          props.value
            ? (props.tone ?? "text-foreground")
            : "text-muted-foreground",
        )}
      >
        <span className="truncate">{props.value ?? "-"}</span>
        {props.original && (
          <span className="text-muted-foreground truncate text-xs font-normal line-through">
            {props.original}
          </span>
        )}
      </dd>
    </div>
  );
}

// AdoRouter: the official list price, struck through, when the model's
// cheapest lane is below it (ShowOriginalPriceEnabled fills the original_*
// fields). The table and model page already showed it; the card did not.
function listPrice(
  value: number,
  original: number | null,
  unit: PriceUnit,
  perCall?: boolean,
) {
  if (original === null || discountPercent(value, original) <= 0) return;
  return fmtUnit(original, unit, perCall);
}

// One card per model. The title is a stretched button (or, with `link`, a
// link to the model page), so the whole card is clickable while the copy
// button keeps its own click.
// Success rate and latency come from the last 24 hours of real requests, so a
// model nobody called yet shows a dash rather than a made-up number.
export function ModelGridCard(props: {
  model: PricingCatalogModel;
  onOpen?: () => void;
  link?: boolean;
}) {
  const locale = useLocale();
  const model = props.model;
  const modality = deriveOutputModality(model);
  const price = modelPriceColumns(model);
  const inUnit = inputPriceUnit(modality, model.is_fixed_price);
  const outUnit = outputPriceUnit(modality, model.is_fixed_price);
  const ctx = model.metadata?.contextWindow ?? model.metadata?.maxInputTokens;
  const discount = bestDiscountPercent(model);
  const uptime = model.uptime_24h ?? undefined;
  const success = model.success_rate ?? undefined;

  return (
    <article className="border-border bg-card hover:border-primary/60 relative flex flex-col rounded-2xl border p-5 transition-colors">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <VendorIcon vendor={model.vendor} size={18} />
        <span className="truncate">{model.vendor}</span>
        <span className="ml-auto flex gap-1.5">
          {discount > 0 && (
            <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
              {discount}% off
            </span>
          )}
          {model.online === false && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
              At capacity
            </span>
          )}
          {model.is_free && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
              Free
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1">
        {props.link ? (
          <Link
            href={modelHref(model.model_name, model.vendor)}
            prefetch={false}
            className={titleClass}
          >
            {model.model_name}
          </Link>
        ) : (
          <button type="button" onClick={props.onOpen} className={titleClass}>
            {model.model_name}
          </button>
        )}
        <CopyButton
          text={model.model_name}
          toastMessage="Model ID copied"
          className="text-muted-foreground hover:text-foreground relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors"
        />
      </div>

      {model.description && (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {model.description}
        </p>
      )}

      <div className="mt-auto pt-5">
        <dl className="border-border [&>div]:border-border grid grid-cols-3 border-t [&>div]:border-b [&>div:not(:nth-child(3n+1))]:border-l [&>div:nth-child(3n+1)]:pl-0 [&>div:nth-child(n+4)]:border-b-0">
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
            label="Max context"
            value={ctx ? formatTokenCount(ctx, locale) : undefined}
          />
          <Stat
            label="Uptime 24h"
            value={uptime !== undefined ? formatPct(uptime, 1) : undefined}
            tone={uptime !== undefined ? rateTone(uptime) : undefined}
          />
          <Stat
            label="Success"
            value={success !== undefined ? formatPct(success, 1) : undefined}
            tone={success !== undefined ? rateTone(success) : undefined}
          />
          <Stat
            label="Latency"
            value={
              model.avg_latency_ms
                ? formatLatency(model.avg_latency_ms)
                : undefined
            }
          />
        </dl>
      </div>
    </article>
  );
}
