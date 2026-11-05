import { EMPTY_METADATA, fixedPriceUnitLabel } from "@/lib/api/model-modality";
import { ApiKeyCodeBlock } from "@/components/elements/code/api-key-code-block";
import { highlightCode } from "@/components/elements/code/code-block";
import { CopyButton } from "@/components/elements/code/copy-button";
import { VendorIcon } from "@/components/elements/brand/vendor-icon";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import {
  findContextTag,
  findSimilarModels,
  vendorDisplayName,
} from "@/lib/api/pricing";
import type { PricingCatalogModel } from "@/openapi";
import type { ModelDetailData } from "@/lib/validation/data-policy";
import { APP_VALUES } from "@/lib/config/constants";
import { getVendorTheme } from "@/lib/config/vendor-registry";
import { modelHref } from "@/lib/utils/base";
import {
  discountPercent,
  formatPrice,
  formatTokenCount,
} from "@/lib/utils/format/number";
import { formatMsDate, formatYearMonth } from "@/lib/utils/format/date";
import { getDocsApiKey } from "@/lib/api/page-data";
import { usesInputsForOwnPurposes } from "@/lib/api/own-purpose";
import { getLocale, getTranslations } from "next-intl/server";
import { AtCapacityBanner } from "./header/at-capacity-banner";
import { OwnPurposeNotice } from "./header/own-purpose-notice";
import { ModelDescription } from "./header/model-description";
import { ModelFaq } from "./header/model-faq";
import { ModelHeaderChips, ModelMetaStats } from "./header/model-header-chips";
import { CodeExamplesTabs } from "./tabs/code-examples-tabs";
import { GridPricingTable } from "./pricing/grid-pricing-table";
import { GroupPricingSection } from "./pricing/group-pricing-section";
import { hasAnyParameter } from "./header/capability-helpers";
import { BenchmarksSection } from "./tabs/benchmarks-section";
import { SectionHeading } from "./shared/section-heading";
import { ModelRankingSection } from "./tabs/model-ranking-section";
import { PerfUptimePanel } from "./tabs/perf-uptime-panel";
import { SupportedParameters } from "./tabs/supported-parameters";
import { TryInChatButton } from "./header/try-in-chat-button";
import { WatchModelButton } from "./header/watch-model-button";

interface ModelDetailProps {
  model: ModelDetailData;
  // Only for the similar-models lookup, which compares vendor id and tags.
  models: PricingCatalogModel[];
  groupRatioMap: Record<string, number>;
  offline: boolean;
  vendorHref: string;
}

export async function ModelDetail(props: ModelDetailProps) {
  const m = props.model;
  const t = await getTranslations();
  const locale = await getLocale();
  const docs = await getDocsApiKey();
  const contextTag = findContextTag(m);
  const similar = findSimilarModels(props.models, {
    model_name: m.model_name,
    vendor_id: m.vendor_id,
    tags: m.tags,
  });

  // A decisions model answers typed questions over a shared state and never
  // speaks chat, so its samples call /v1/decisions instead.
  const decisions = (m.supported_endpoint_types ?? []).includes(
    "typesafe-decisions",
  );

  const decisionsBody = `{
    "model": "${m.model_name}",
    "state": {"ticket": "Payment failed twice, customer asks for a refund."},
    "questions": {
      "refund": {"type": "noul", "instructions": "Should we refund?"},
      "team": {"type": "choice", "instructions": "Which team handles it?", "criteria": {"billing": null, "support": null}},
      "urgency": {"type": "score", "instructions": "How urgent is it?", "criteria": ["Low", "Medium", "High"]}
    }
  }`;

  const curlExample = decisions
    ? `curl ${docs.apiUrl}/v1/decisions \\
  -H "Authorization: Bearer ${docs.placeholder}" \\
  -H "Content-Type: application/json" \\
  -d '${decisionsBody}'`
    : `curl ${docs.apiUrl}/v1/chat/completions \\
  -H "Authorization: Bearer ${docs.placeholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${m.model_name}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const tsExample = decisions
    ? `const res = await fetch("${docs.apiUrl}/v1/decisions", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${docs.placeholder}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${decisionsBody}),
});

const { answers } = await res.json();
console.log(answers);`
    : `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${docs.apiUrl}/v1",
  apiKey: "${docs.placeholder}",
});

const res = await client.chat.completions.create({
  model: "${m.model_name}",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(res.choices[0].message.content);`;

  const pyExample = decisions
    ? `import requests

res = requests.post(
    "${docs.apiUrl}/v1/decisions",
    headers={"Authorization": "Bearer ${docs.placeholder}"},
    json=${decisionsBody.replace(/\bnull\b/g, "None")},
)

print(res.json()["answers"])`
    : `from openai import OpenAI

client = OpenAI(
    base_url="${docs.apiUrl}/v1",
    api_key="${docs.placeholder}",
)

res = client.chat.completions.create(
    model="${m.model_name}",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(res.choices[0].message.content)`;

  const [curlHtml, tsHtml, pyHtml] = await Promise.all([
    highlightCode(curlExample, "bash"),
    highlightCode(tsExample, "typescript"),
    highlightCode(pyExample, "python"),
  ]);
  const theme = getVendorTheme(m.vendor);
  const meta = m.metadata ?? EMPTY_METADATA;
  const endpoints = m.supported_endpoint_types ?? [];

  const released = m.release_ts;
  const releaseDateLabel = released ? formatMsDate(released) : "";
  const lastUpdatedMs = m.created_time ? m.created_time * 1000 : released;
  const lastUpdatedLabel = lastUpdatedMs ? formatMsDate(lastUpdatedMs) : "";
  const knowledgeCutoff = formatYearMonth(meta.knowledgeCutoff) ?? "";
  const ctxTokens = meta.contextWindow ?? meta.maxInputTokens;
  const ctx = ctxTokens ? formatTokenCount(ctxTokens, locale) : contextTag;
  const maxOut = meta.maxOutputTokens;
  const similarModels = [...similar.sameVendor, ...similar.sameTag];

  const fixedUnit =
    fixedPriceUnitLabel(m) === "second"
      ? t("MODEL_PAGE.PER_SECOND_UNIT")
      : fixedPriceUnitLabel(m) === "image"
        ? t("MODEL_PAGE.PER_IMAGE_UNIT")
        : t("MODEL_PAGE.PER_REQUEST_UNIT");

  const facts: { label: string; value: string }[] = [
    ctx ? { label: "Context", value: `${ctx} tokens` } : null,
    maxOut
      ? {
          label: "Max output",
          value: `${formatTokenCount(maxOut, locale)} tokens`,
        }
      : null,
    endpoints.length > 0
      ? { label: "Endpoints", value: endpoints.join(", ") }
      : null,
    releaseDateLabel ? { label: "Released", value: releaseDateLabel } : null,
    knowledgeCutoff
      ? { label: "Knowledge cutoff", value: knowledgeCutoff }
      : null,
    lastUpdatedLabel ? { label: "Updated", value: lastUpdatedLabel } : null,
  ].filter((f) => f !== null);

  // AdoRouter layout: a plain header, then one column of sections beside a
  // sticky panel with the price and the facts a caller needs. unorouter's
  // version used a vendor-tinted glow and Overview / API / Benchmarks tabs.
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-28 pb-20">
      <nav className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <Link href="/models" className="hover:text-foreground">
          Models
        </Link>
        <span aria-hidden>/</span>
        <a href={props.vendorHref} className="hover:text-foreground">
          {vendorDisplayName(m.vendor)}
        </a>
      </nav>

      <header className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="text-muted-foreground flex items-center gap-2">
            <VendorIcon vendor={m.icon ?? m.vendor} size={20} />
            <span>{m.vendor}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="min-w-0 font-mono text-3xl font-bold tracking-tight break-all md:text-5xl">
              {m.model_name}
            </h1>
            <CopyButton
              text={m.model_name}
              toastMessage="Model ID copied"
              className="text-muted-foreground hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TryInChatButton
            modelName={m.model_name}
            label="Try in chat"
            loginLabel="Try in chat"
            icon
            disabled={props.offline}
          />
          <WatchModelButton modelName={m.model_name} />
        </div>
      </header>

      {m.description && (
        <div className="text-foreground/80 mt-6 max-w-3xl text-lg">
          <ModelDescription text={m.description} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        <ModelHeaderChips metadata={meta} locale={locale} />
        <ModelMetaStats metadata={meta} />
      </div>

      {props.offline && <AtCapacityBanner />}
      {usesInputsForOwnPurposes(m) && <OwnPurposeNotice />}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="lg:order-last">
          <div className="border-border bg-card rounded-2xl border p-6 lg:sticky lg:top-24">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Price
            </p>
            <div className="mt-4 space-y-4">
              {m.is_fixed_price ? (
                <PriceLine
                  label={t("MODEL_PAGE.FIXED_PRICE")}
                  value={m.fixed_price}
                  original={m.original_fixed_price ?? null}
                  unit={fixedUnit}
                />
              ) : (
                <>
                  <PriceLine
                    label="Input"
                    value={m.input_price}
                    original={m.original_input_price ?? null}
                    unit={t("MODEL_PAGE.PER_MILLION_UNIT")}
                  />
                  <PriceLine
                    label="Output"
                    value={m.output_price}
                    original={m.original_output_price ?? null}
                    unit={t("MODEL_PAGE.PER_MILLION_UNIT")}
                  />
                </>
              )}
            </div>

            {facts.length > 0 && (
              <dl className="border-border mt-6 space-y-3 border-t pt-5 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-medium break-all">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="border-border mt-6 border-t pt-5">
              <p className="text-muted-foreground text-sm">Base URL</p>
              <div className="mt-1 flex items-center gap-1">
                <code className="min-w-0 truncate font-mono text-sm">
                  {`${docs.apiUrl}/v1`}
                </code>
                <CopyButton
                  text={`${docs.apiUrl}/v1`}
                  toastMessage="Base URL copied"
                  className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-full transition-colors"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-14">
          <section>
            <SectionHeading theme={theme} className="mb-1">
              Call it from your code
            </SectionHeading>
            <p className="text-muted-foreground mb-4">
              {t("MODEL_PAGE.CODE_DESC", APP_VALUES)}
            </p>
            <CodeExamplesTabs
              curl={
                <ApiKeyCodeBlock
                  html={curlHtml}
                  code={curlExample}
                  language="bash"
                  placeholder={docs.placeholder}
                />
              }
              typescript={
                <ApiKeyCodeBlock
                  html={tsHtml}
                  code={tsExample}
                  language="typescript"
                  placeholder={docs.placeholder}
                />
              }
              python={
                <ApiKeyCodeBlock
                  html={pyHtml}
                  code={pyExample}
                  language="python"
                  placeholder={docs.placeholder}
                />
              }
            />
          </section>

          {(m.grid_pricing || (m.enable_groups.length > 0 && !m.is_tiered)) && (
            <section>
              <SectionHeading theme={theme}>Pricing details</SectionHeading>
              {m.grid_pricing && (
                <GridPricingTable
                  rows={m.grid_pricing}
                  priceLabel={t("MODEL_PAGE.GRID_PRICE_HEADER")}
                  multiplier={m.grid_min_ratio}
                />
              )}
              {m.enable_groups.length > 0 && !m.is_tiered && (
                <GroupPricingSection
                  model={m}
                  groupRatioMap={props.groupRatioMap}
                  groupProviders={m.group_providers ?? {}}
                  theme={theme}
                />
              )}
            </section>
          )}

          <div className="[&>section]:mt-0 [&>section+section]:mt-14">
            <PerfUptimePanel modelName={m.model_name} theme={theme} />
          </div>

          <section>
            <ModelRankingSection
              modelName={m.model_name}
              vendorName={m.vendor}
            />
          </section>

          {hasAnyParameter(meta) && (
            <section>
              <SectionHeading theme={theme}>
                {t("MODELS.DETAIL.SUPPORTED_PARAMETERS")}
              </SectionHeading>
              <div className="border-border overflow-hidden rounded-2xl border">
                <SupportedParameters metadata={meta} />
              </div>
            </section>
          )}

          <section>
            <BenchmarksSection modelName={m.model_name} vendorName={m.vendor} />
          </section>

          <section>
            <ModelFaq model={m} />
          </section>

          {similarModels.length > 0 && (
            <section>
              <SectionHeading theme={theme}>
                {t("MODEL_PAGE.SIMILAR_TITLE")}
              </SectionHeading>
              <ul className="border-border divide-border divide-y rounded-2xl border">
                {similarModels.map((sim) => (
                  <li key={sim.model_name}>
                    <Link
                      href={modelHref(sim.model_name, sim.vendor)}
                      prefetch={false}
                      className="hover:bg-muted/40 flex items-center gap-3 px-5 py-4 transition-colors"
                    >
                      <VendorIcon vendor={sim.icon ?? sim.vendor} size={20} />
                      <span className="min-w-0 flex-1 truncate font-mono font-semibold">
                        {sim.model_name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {sim.vendor}
                      </span>
                      <Icon
                        name="arrow-right"
                        className="text-muted-foreground h-4 w-4"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/docs" />}
          >
            <Icon name="file-text" className="h-4 w-4" />
            {t("MODEL_PAGE.VIEW_DOCS")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PriceLine(props: {
  label: string;
  value: number;
  original: number | null;
  unit: string;
}) {
  const pct = discountPercent(props.value, props.original);
  return (
    <div>
      <p className="text-muted-foreground text-sm">{props.label}</p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {formatPrice(props.value)}
        </span>
        <span className="text-muted-foreground text-sm">{props.unit}</span>
        {pct > 0 && props.original !== null && (
          <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
            {pct}% off
          </span>
        )}
      </p>
    </div>
  );
}
