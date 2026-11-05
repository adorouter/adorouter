"use client";

import { VendorIcon } from "@/components/elements/brand/vendor-icon";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBar } from "@/components/ui/status/status-bar";
import { usePerfMetricsSummaryQuery } from "@/hooks/models/perf-metrics-hook";
import { BUCKET_OPTIONS, useStatusFilter } from "@/hooks/ui/use-status-hook";
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils";
import { formatHoursLabel } from "@/lib/utils/format/date";
import { formatLatency, formatTps } from "@/lib/utils/format/number";
import type { ModelSummary } from "@/openapi";
import { StatusBlocksI18n } from "./status-blocks-i18n";

type Tone = "success" | "degraded" | "error";

const TONE = {
  success: {
    label: "Operational",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400",
    text: "text-amber-400",
  },
  error: { label: "Down", dot: "bg-red-500", text: "text-red-400" },
} satisfies Record<Tone, { label: string; dot: string; text: string }>;

const OVERALL: Record<Tone, string> = {
  success: "All models are operational",
  degraded: "Some models are degraded",
  error: "Most models are down",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "success", label: "Operational" },
  { value: "degraded", label: "Degraded" },
  { value: "error", label: "Down" },
] as const;

function toTone(status: string): Tone {
  return status === "degraded" || status === "error" ? status : "success";
}

// AdoRouter layout: a plain header with the overall state, one stats strip and
// a flat list of model rows, inside the site's navbar and footer. unorouter's
// version was a standalone centred page with banners and summary cards.
export function StatusPage() {
  const s = useStatusFilter();
  const perfQuery = usePerfMetricsSummaryQuery(24);
  const perfMap = new Map<string, ModelSummary>(
    (perfQuery.data?.models ?? []).map((row) => [row.model_name, row]),
  );

  // The flat filtered list, not the grouped items: grouping by vendor and the
  // collapsed-vendor cookie add nothing with a short catalog.
  const rows = s.filtered;
  const total = s.allComponents.length;
  const counts = { success: 0, degraded: 0, error: 0 };
  for (const c of s.allComponents) counts[toTone(c.status)] += 1;
  const overall = toTone(s.overallStatus);

  return (
    <StatusBlocksI18n>
      <div className="mx-auto w-full max-w-5xl px-5 pt-28 pb-20">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Status
            </h1>
            <p className="text-foreground/80 mt-3 text-lg">
              Availability of each model, updated every minute.
            </p>
          </div>
          <div className="border-border bg-card flex items-center gap-3 rounded-full border px-5 py-2.5">
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                  TONE[overall].dot,
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  TONE[overall].dot,
                )}
              />
            </span>
            <span className="font-medium">{OVERALL[overall]}</span>
          </div>
        </header>

        <dl className="border-border mt-10 grid grid-cols-2 rounded-2xl border sm:grid-cols-4">
          {[
            { label: "Models", value: total, tone: "text-foreground" },
            {
              label: "Operational",
              value: counts.success,
              tone: TONE.success.text,
            },
            {
              label: "Degraded",
              value: counts.degraded,
              tone:
                counts.degraded > 0 ? TONE.degraded.text : "text-foreground/60",
            },
            {
              label: "Down",
              value: counts.error,
              tone: counts.error > 0 ? TONE.error.text : "text-foreground/60",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "border-border px-6 py-5",
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t sm:border-t-0",
                i === 2 && "sm:border-l",
              )}
            >
              <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                {stat.label}
              </dt>
              <dd
                className={cn(
                  "mt-1 text-3xl font-bold tabular-nums",
                  stat.tone,
                )}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="border-border focus-within:border-foreground/50 flex flex-1 items-center gap-2 rounded-full border px-4 py-2">
            <Icon name="search" className="text-muted-foreground h-4 w-4" />
            <input
              value={s.search}
              onChange={(e) => s.setSearch(e.target.value)}
              placeholder="Search models"
              aria-label="Search models"
              className="w-full bg-transparent outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = s.statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => s.setStatusFilter(f.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-foreground/80 hover:border-foreground/40",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
            <Select
              value={s.bucket}
              onValueChange={(v) => {
                const option = BUCKET_OPTIONS.find((o) => o.value === v);
                if (option) s.setBucket(option.value);
              }}
            >
              <SelectTrigger
                aria-label="Time window"
                className="rounded-full text-sm"
              >
                <SelectValue>{formatHoursLabel(s.hours)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BUCKET_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {formatHoursLabel(o.hours)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          {s.isPending && rows.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border bg-card h-32 animate-pulse rounded-2xl border"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="border-border text-muted-foreground rounded-2xl border border-dashed p-6">
              No models match these filters.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((c) => {
                const tone = TONE[toTone(c.status)];
                const perf = perfMap.get(c.name);
                return (
                  <li
                    key={c.id}
                    className="border-border bg-card rounded-2xl border p-5"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <VendorIcon vendor={s.vendorOf(c.name)} size={18} />
                      <span className="min-w-0 truncate font-mono text-lg font-semibold">
                        {c.name}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium",
                          tone.text,
                        )}
                      >
                        <span className={cn("size-2 rounded-full", tone.dot)} />
                        {tone.label}
                      </span>
                      <span className="text-muted-foreground ml-auto flex items-center gap-4 text-sm tabular-nums">
                        {perf && perf.request_count > 0 && (
                          <>
                            <span title="Average latency, last 24 hours">
                              {formatLatency(perf.avg_latency_ms, 1)}
                            </span>
                            <span title="Average output speed, last 24 hours">
                              {formatTps(perf.avg_tps, "t/s")}
                            </span>
                          </>
                        )}
                        <span className="text-foreground font-semibold">
                          {c.uptime_24h.toFixed(2)}% uptime
                        </span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <StatusBar data={s.bars[c.name] ?? []} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {env.discordUrl && (
          <p className="text-muted-foreground mt-10">
            Incident updates are posted on{" "}
            <a
              href={env.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              our Discord server
            </a>
            .
          </p>
        )}
      </div>
    </StatusBlocksI18n>
  );
}
