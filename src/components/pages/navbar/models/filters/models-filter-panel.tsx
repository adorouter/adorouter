"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { PricingCatalogModel } from "@/openapi";
import {
  categoriesAtom,
  clearFiltersAtom,
  contextMinAtom,
  inputModalitiesAtom,
  isDirtyAtom,
  maxAgeDaysAtom,
  outputPriceMaxAtom,
  priceRangeAtom,
  selectedVendorsAtom,
  seriesAtom,
  supportedParametersAtom,
  toolsOnlyAtom,
  discountedOnlyAtom,
  hideFreeAtom,
} from "@/store/models-store";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
import {
  ContextGroup,
  InputModalitiesGroup,
  ModelAgeGroup,
  MultiSelectGroup,
  PriceGroup,
  ToolsGroup,
  PricingGroup,
} from "./filter-groups";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

// AdoRouter: the filters as a plain panel the models page places itself (a
// sticky column beside the grid, or above it on phones), rather than
// upstream's offcanvas sidebar.
export function ModelsFilterPanel(props: { models: PricingCatalogModel[] }) {
  const t = useTranslations();

  const [inputModalities, setInputModalities] = useAtom(inputModalitiesAtom);
  const [contextMin, setContextMin] = useAtom(contextMinAtom);
  const [priceRange, setPriceRange] = useAtom(priceRangeAtom);
  const [outputPriceMax, setOutputPriceMax] = useAtom(outputPriceMaxAtom);
  const [maxAgeDays, setMaxAgeDays] = useAtom(maxAgeDaysAtom);
  const [series, setSeries] = useAtom(seriesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [supportedParameters, setSupportedParameters] = useAtom(
    supportedParametersAtom,
  );
  const [selectedVendors, setSelectedVendors] = useAtom(selectedVendorsAtom);
  const [toolsOnly, setToolsOnly] = useAtom(toolsOnlyAtom);
  const [hideFree, setHideFree] = useAtom(hideFreeAtom);
  const [discountedOnly, setDiscountedOnly] = useAtom(discountedOnlyAtom);
  const isDirty = useAtomValue(isDirtyAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);

  const seriesOptions = uniqueSorted(
    props.models
      .map((m) => m.metadata?.series)
      .filter((s): s is string => Boolean(s)),
  );
  const typeTags = new Set(["text", "image", "video", "audio", "embedding"]);
  const categoryOptions = uniqueSorted(
    props.models.flatMap((m) =>
      m.metadata?.categories && m.metadata?.categories.length > 0
        ? m.metadata?.categories
        : m.tags.filter((tag) => !typeTags.has(tag.toLowerCase())),
    ),
  );
  const paramOptions = uniqueSorted(
    props.models.flatMap((m) => m.metadata?.supportedParametersAll ?? []),
  );
  const vendorOptions = uniqueSorted(props.models.map((m) => m.vendor));

  return (
    <div className="border-border flex flex-col rounded-2xl border py-2">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-sm font-semibold">
          {t("MODELS.FILTER.TITLE")}
        </span>
        {isDirty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearFilters()}
            className="h-7 px-2"
          >
            {t("MODELS.FILTER.RESET")}
            <Icon name="x" className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1 px-2 pb-1">
        <InputModalitiesGroup
          value={inputModalities}
          onChange={setInputModalities}
        />
        <ToolsGroup value={toolsOnly} onChange={setToolsOnly} />
        <PricingGroup
          value={hideFree}
          onChange={setHideFree}
          discountedOnly={discountedOnly}
          onDiscountedOnlyChange={setDiscountedOnly}
        />
        <ContextGroup value={contextMin} onChange={setContextMin} />
        <PriceGroup
          label={t("MODELS.FILTER.PROMPT_PRICING")}
          value={priceRange[1]}
          onChange={(n) => setPriceRange([0, n])}
        />
        <PriceGroup
          label={t("MODELS.FILTER.OUTPUT_PRICING")}
          value={outputPriceMax}
          onChange={setOutputPriceMax}
        />
        <ModelAgeGroup value={maxAgeDays} onChange={setMaxAgeDays} />
        <MultiSelectGroup
          label={t("MODELS.FILTER.SERIES")}
          options={seriesOptions}
          value={series}
          onChange={setSeries}
        />
        <MultiSelectGroup
          label={t("MODELS.FILTER.CATEGORIES")}
          options={categoryOptions}
          value={categories}
          onChange={setCategories}
        />
        <MultiSelectGroup
          label={t("MODELS.FILTER.SUPPORTED_PARAMETERS")}
          options={paramOptions}
          value={supportedParameters}
          onChange={setSupportedParameters}
        />
        <MultiSelectGroup
          label={t("MODELS.FILTER.PROVIDERS")}
          options={vendorOptions}
          value={selectedVendors}
          onChange={setSelectedVendors}
        />
      </div>
    </div>
  );
}
