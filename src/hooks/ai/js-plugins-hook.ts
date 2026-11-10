"use client";

// AdoRouter: read only. The plain chat has no plugin editor or import.
import { readLocalJsPlugins } from "@/lib/db/client/data/rp/js-plugins";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function useJsPluginsQuery() {
  return useQuery({
    queryKey: queryKeys.jsPlugins(),
    queryFn: async () => (await readLocalJsPlugins()) ?? [],
  });
}
