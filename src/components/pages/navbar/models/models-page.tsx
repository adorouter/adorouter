"use client";

import { useModelsFilter } from "@/hooks/ui/use-models-hook";
import {
  countByOutputModality,
  OUTPUT_MODALITIES,
  type OutputModality,
} from "@/lib/api/model-modality";
import { msg } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { clearFiltersAtom, isDirtyAtom } from "@/store/models-store";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ModelGridCard } from "./browse/model-grid-card";
import { ModelsEmpty } from "./browse/models-empty";
import { SearchBox } from "./browse/models-toolbar";
import { ModelsUrlSync } from "./models-url-sync";

// Static import chained recharts (PerformanceSection) into the initial models
// bundle; the sheet only renders after a card click.
const ModelDetailSheet = dynamic(
  () =>
    import("./detail/model-detail-sheet").then((m) => ({
      default: m.ModelDetailSheet,
    })),
  { ssr: false },
);

const MODALITY_LABEL_KEY = {
  all: msg("MODELS.MODALITY.ALL"),
  text: msg("MODELS.MODALITY.TEXT"),
  image: msg("MODELS.MODALITY.IMAGE"),
  audio: msg("MODELS.MODALITY.AUDIO"),
  video: msg("MODELS.MODALITY.VIDEO"),
  embeddings: msg("MODELS.MODALITY.EMBEDDINGS"),
  decisions: msg("MODELS.MODALITY.DECISIONS"),
} satisfies Record<OutputModality, ReturnType<typeof msg>>;

// A header, modality chips and a card grid, rather than unorouter's filter
// sidebar and table. With a small catalog the sidebar's filters sat empty.
export function ModelsPage() {
  const t = useTranslations();
  const m = useModelsFilter();
  const clearFilters = useSetAtom(clearFiltersAtom);
  const isDirty = useAtomValue(isDirtyAtom);

  const counts = countByOutputModality(m.tabModels);
  const chips = OUTPUT_MODALITIES.filter(
    (modality) =>
      modality === "all" ||
      counts[modality] > 0 ||
      m.outputModality === modality,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6">
      <ModelsUrlSync />

      <header className="flex flex-col gap-6 pt-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Models
        </h1>
        <SearchBox className="relative w-full md:w-80" />
      </header>

      {chips.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {chips.map((modality) => {
            const active = m.outputModality === modality;
            return (
              <button
                key={modality}
                type="button"
                aria-pressed={active}
                onClick={() => m.setOutputModality(modality)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground/80 hover:border-foreground/40",
                )}
              >
                {t(MODALITY_LABEL_KEY[modality])}
                <span className="ml-1.5 opacity-60">
                  {modality === "all" ? m.tabModels.length : counts[modality]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        {m.filtered.length === 0 ? (
          <ModelsEmpty
            filtered={isDirty}
            count={isDirty ? 1 : 0}
            onReset={clearFilters}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {m.filtered.map((model) => (
              <ModelGridCard
                key={model.model_name}
                model={model}
                onOpen={() => m.setSelectedModelName(model.model_name)}
              />
            ))}
          </div>
        )}
      </div>

      <ModelDetailSheet
        model={m.selectedModel}
        endpointMap={m.endpointMap}
        open={m.selectedModel !== null}
        onOpenChange={(open) => {
          if (!open) m.setSelectedModelName(null);
        }}
      />
    </div>
  );
}
