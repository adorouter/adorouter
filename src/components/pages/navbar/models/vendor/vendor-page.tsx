"use client";

import { VendorIcon } from "@/components/elements/brand/vendor-icon";
import { usePricingVendorQuery } from "@/hooks/models/pricing-hook";
import { Link } from "@/i18n/navigation";
import { vendorDisplayName } from "@/lib/api/pricing";
import { vendorSlug } from "@/lib/utils/base";
import { useTranslations } from "next-intl";
import { ModelGridCard } from "../browse/model-grid-card";

// AdoRouter: same header and cards as the Models page, so a vendor page reads
// as a filtered view of it rather than unorouter's own vendor layout.
export function VendorModelsPage(props: { vendor: string }) {
  const t = useTranslations();
  const query = usePricingVendorQuery(props.vendor);
  const target = vendorSlug(props.vendor);

  const models = (query.data ?? []).filter(
    (m) => vendorSlug(m.vendor) === target,
  );
  // Split rather than interleave: the catalog sorts by release date, so without
  // this a dead model lands above a working one. Both stay on the page, because
  // a model page nothing links to is a model page Google never crawls.
  const live = models.filter((m) => m.online);
  const busy = models.filter((m) => !m.online);

  const display = vendorDisplayName(props.vendor);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6">
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link href="/models" className="hover:text-foreground">
          Models
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{display}</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="flex items-center gap-3 text-4xl font-bold tracking-tight md:text-5xl">
          <VendorIcon vendor={props.vendor} size={40} />
          {display}
        </h1>
        <p className="text-muted-foreground">
          {models.length === 1 ? "1 model" : `${models.length} models`}
        </p>
      </header>

      <div className="mt-10">
        {models.length === 0 ? (
          query.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-border bg-card h-56 animate-pulse rounded-2xl border"
                />
              ))}
            </div>
          ) : (
            <p className="border-border text-muted-foreground rounded-2xl border border-dashed p-6">
              {t("MODELS.VENDOR.EMPTY")}
            </p>
          )
        ) : (
          <>
            {live.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {live.map((model) => (
                  <ModelGridCard key={model.model_name} model={model} link />
                ))}
              </div>
            )}

            {busy.length > 0 && (
              <section className={live.length > 0 ? "mt-14" : undefined}>
                <h2 className="text-xl font-semibold tracking-tight">
                  At capacity
                </h2>
                <p className="text-muted-foreground mt-1 mb-5">
                  {t("MODELS.VENDOR.AT_CAPACITY_NOTE")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {busy.map((model) => (
                    <ModelGridCard key={model.model_name} model={model} link />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
