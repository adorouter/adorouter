import { describe, expect, test } from "bun:test";
import { getTableColumns } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  characters,
  conversationCharacters,
  lorebooks,
  messageItems,
  messages,
  personas,
  samplingPresets,
} from "@/lib/db/schema/shared";
import type { NativeImport, OrpgImport } from "@/lib/types";
import { mapNativeImport, mapOrpgImport } from "./map";

const STAMP = "2026-11-10T09:30:00.000Z";

// What "Export (native)" writes, after the trip through a JSON file.
const exported = (): NativeImport =>
  JSON.parse(
    JSON.stringify({
      version: "native",
      conversation: { id: "conv", title: "Backup" },
      settings: { defaultModel: "some-model", chatMemory: 12 },
      messages: [
        {
          id: "m1",
          parentId: null,
          role: "user",
          createdAt: new Date(STAMP),
          updatedAt: new Date(STAMP),
        },
        {
          id: "m2",
          parentId: "m1",
          role: "assistant",
          createdAt: new Date(STAMP),
          updatedAt: new Date(STAMP),
        },
      ],
      items: [
        {
          id: "i1",
          messageId: "m1",
          sequenceIndex: 0,
          type: "text",
          data: { text: "Hello" },
          createdAt: new Date(STAMP),
        },
        {
          id: "i2",
          messageId: "m2",
          sequenceIndex: 0,
          type: "text",
          data: { text: "Hi" },
          createdAt: "not a date",
        },
      ],
      characters: [
        {
          id: "c1",
          name: "Old character",
          createdAt: new Date(STAMP),
          updatedAt: new Date(STAMP),
        },
      ],
      persona: {
        id: "p1",
        name: "Old persona",
        createdAt: new Date(STAMP),
        updatedAt: new Date(STAMP),
      },
      preset: {
        id: "s1",
        name: "Old preset",
        createdAt: new Date(STAMP),
        updatedAt: new Date(STAMP),
      },
      lorebooks: [
        {
          id: "l1",
          name: "Old lorebook",
          createdAt: new Date(STAMP),
          updatedAt: new Date(STAMP),
        },
      ],
      lorebookEntries: [
        { id: "e1", lorebookId: "l1", keys: ["k"], content: "entry" },
      ],
      bindings: {
        characters: [
          { characterId: "c1", orderIndex: 0, createdAt: new Date(STAMP) },
        ],
        lorebooks: [{ lorebookId: "l1", orderIndex: 0 }],
      },
    }),
  );

// The insert binds each value through its column, which is where a date left
// as a string throws "getTime is not a function".
function bind(table: SQLiteTable, row: Record<string, unknown>) {
  const columns = getTableColumns(table);
  for (const [key, column] of Object.entries(columns)) {
    if (row[key] == null) continue;
    column.mapToDriverValue(row[key]);
  }
}

describe("mapNativeImport", () => {
  test("every row of a native export can be written back", () => {
    const mapped = mapNativeImport(exported());
    const write = () => {
      for (const m of mapped.bundle.messages) bind(messages, m);
      for (const it of mapped.bundle.messageItems) bind(messageItems, it);
      for (const c of mapped.characters) bind(characters, c);
      for (const lb of mapped.lorebooks) bind(lorebooks, lb.lorebook);
      for (const b of mapped.bundle.conversationCharacters) {
        bind(conversationCharacters, b);
      }
      bind(personas, mapped.persona!);
      bind(samplingPresets, mapped.preset!);
    };
    expect(write).not.toThrow();
  });

  test("keeps the exported time, and drops one it cannot read", () => {
    const [first, second] = mapNativeImport(exported()).bundle.messageItems;
    expect(first.createdAt).toEqual(new Date(STAMP));
    expect("createdAt" in second).toBe(false);
  });

  test("items follow their message to its new id", () => {
    const { bundle } = mapNativeImport(exported());
    const [m1, m2] = bundle.messages;
    expect(m1.id).not.toBe("m1");
    expect(m2.parentId).toBe(m1.id);
    expect(bundle.messageItems.map((it) => it.messageId)).toEqual([
      m1.id,
      m2.id,
    ]);
    expect(bundle.settings.defaultModel).toBe("some-model");
  });
});

describe("mapOrpgImport", () => {
  test("leaves the model to the chat instead of naming a foreign one", () => {
    const file: OrpgImport = {
      version: "orpg.3.0",
      title: "Playground",
      characters: { a: { id: "a", name: "Assistant", model: "vendor/model" } },
      messages: {
        u: { id: "u", type: "user", characterId: "USER", items: [{ id: "x" }] },
      },
      items: { x: { id: "x", data: { type: "text", content: "Hello" } } },
    };
    const mapped = mapOrpgImport(file);
    expect(mapped.bundle.settings.defaultModel).toBe("");
    expect(mapped.bundle.messageItems).toHaveLength(1);
  });
});
