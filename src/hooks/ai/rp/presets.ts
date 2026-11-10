"use client";

// AdoRouter: read only. The plain chat has no preset editor or import.
import { readLocalPresets } from "@/lib/db/client/data/rp/rp";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function usePresetsQuery() {
  return useQuery({
    queryKey: queryKeys.presets(),
    queryFn: async () => (await readLocalPresets()) ?? [],
  });
}
