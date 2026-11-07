"use client";

import type { ProviderRow } from "./provider-rows";

import { countryName } from "@/components/elements/model/group-data-policy";
import { DataTable } from "@/components/elements/table/data-table";
import type { ViewMode } from "@/components/pages/navbar/models/filters/view-mode-toggle";
import type { DataTableId } from "@/lib/types/enums";
import { useLocale, useTranslations } from "next-intl";
import { buildProviderColumns } from "./provider-columns";
import { ProviderCard } from "./provider-card";
import {
  ProviderDetails,
  ProviderSelectAll,
  type ProviderHandlers,
  type ProviderSelection,
} from "./provider-parts";

// One rendering for the providers tab and the per-model view: single-line
// rows, details (lanes, every model) in the expanded row.
export function ProviderList(props: {
  id: DataTableId;
  providers: ProviderRow[];
  view: ViewMode;
  handlers: ProviderHandlers;
  isLoading?: boolean;
  selection?: ProviderSelection;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const columns = buildProviderColumns({
    handlers: props.handlers,
    countryLabel: (code) => countryName(code, locale),
    selection: props.selection,
  });
  if (props.view === "list")
    return (
      <div className="space-y-3">
        {props.selection && (
          <label className="flex items-center gap-3 px-2 py-1">
            <ProviderSelectAll selection={props.selection} />
            <span className="text-muted-foreground text-xs">
              {t("PROVIDER_CONSENT.SELECT.ALL")}
            </span>
          </label>
        )}
        {props.providers.map((provider) => (
          <ProviderCard
            key={provider.alias}
            provider={provider}
            handlers={props.handlers}
            selection={props.selection}
            // AdoRouter: one provider can hold every lane (a marketplace), so a
            // lone row opens to show its models instead of reading as one item.
            defaultOpen={props.providers.length === 1}
          />
        ))}
      </div>
    );
  return (
    <DataTable
      id={props.id}
      data={props.providers}
      columns={columns}
      localSorting
      isLoading={props.isLoading}
      rowClassName={(row) => (row.original.active ? undefined : "opacity-60")}
      getRowCanExpand={(row) => !row.original.reason}
      renderExpandedRow={(row) => <ProviderDetails provider={row.original} />}
    />
  );
}
