"use client";

// AdoRouter: read only. The plain chat has no custom provider editor.
import { readLocalCustomProviders } from "@/lib/db/client/data/rp/custom-providers";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function useCustomProvidersQuery() {
  return useQuery({
    queryKey: queryKeys.customProviders(),
    queryFn: async () => (await readLocalCustomProviders()) ?? [],
  });
}
