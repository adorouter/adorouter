"use client";

// AdoRouter: read only. The plain chat has no card editor or import.
import { readLocalCards } from "@/lib/db/client/data/rp/rp";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function useCardsQuery() {
  return useQuery({
    queryKey: queryKeys.cards(),
    queryFn: async () => (await readLocalCards()) ?? [],
  });
}
