"use client";

// AdoRouter: read only. The plain chat has no persona editor or import.
import { readLocalPersonas } from "@/lib/db/client/data/rp/rp";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function usePersonasQuery() {
  return useQuery({
    queryKey: queryKeys.personas(),
    queryFn: async () => (await readLocalPersonas()) ?? [],
  });
}
