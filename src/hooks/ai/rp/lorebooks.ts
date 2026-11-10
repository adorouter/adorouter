"use client";

// AdoRouter: read only. The plain chat has no lorebook editor or import.
import { readLocalLorebooks } from "@/lib/db/client/data/rp/rp";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function useLorebooksQuery() {
  return useQuery({
    queryKey: queryKeys.lorebooks(),
    queryFn: async () => (await readLocalLorebooks()) ?? [],
  });
}
