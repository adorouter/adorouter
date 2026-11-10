"use client";

// AdoRouter: read only. The plain chat has no character editor or card
// import; chats imported from an older export can still carry characters.
import {
  readLocalCharacter,
  readLocalCharacters,
} from "@/lib/db/client/data/rp/rp";
import { queryKeys } from "@/lib/react-query/keys";
import { useQuery } from "@tanstack/react-query";

export function useCharactersQuery() {
  return useQuery({
    queryKey: queryKeys.characters(),
    queryFn: async () => (await readLocalCharacters()) ?? [],
  });
}

export function useCharacterQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.character(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("not-found");
      const item = await readLocalCharacter(id);
      if (!item) throw new Error("not-found");
      return item;
    },
    enabled: !!id,
  });
}
