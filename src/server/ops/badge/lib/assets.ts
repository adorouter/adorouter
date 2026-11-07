import messages from "@/i18n/messages/en.json";
import { LOCALES } from "@/lib/config/constants";
import { readFileSync } from "fs";
import type { Locale } from "next-intl";
import { join } from "path";
import type { SatoriOptions } from "satori";
import { createTranslator } from "use-intl/core";

// AdoRouter: the badge logo is the PNG app icon. logo.svg draws its "A" as
// <text> in Georgia, which the badge renderer has no font for, and the inliner
// below in utils.ts assumed upstream's 250-unit logo. With no inner SVG the
// PNG stays embedded as an image.
const logoPng = readFileSync(
  join(process.cwd(), "public", "images", "icons", "icon-192.png"),
);

export const logoDataUri = `data:image/png;base64,${logoPng.toString("base64")}`;

export const logoInnerSvg = "";

const fontsDir = join(process.cwd(), "src", "server", "ops", "badge", "fonts");

export const fonts: SatoriOptions["fonts"] = [
  {
    name: "Space Grotesk",
    data: readFileSync(join(fontsDir, "space-grotesk-400.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Space Grotesk",
    data: readFileSync(join(fontsDir, "space-grotesk-700.ttf")),
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    name: "JetBrains Mono",
    data: readFileSync(join(fontsDir, "jetbrains-mono-700.ttf")),
    weight: 700 as const,
    style: "normal" as const,
  },
];

// AdoRouter: English only. The messages are imported into the bundle rather
// than read from disk, since they no longer sit in public/. Every locale
// renders in English.
const translator = createTranslator({ locale: LOCALES[0], messages });
// Badge keys are built at runtime; an unknown one falls back to the key below.
type MessageKey = Parameters<typeof translator>[0];

export function t(_locale: Locale, key: string): string {
  try {
    return translator(key as MessageKey);
  } catch {
    return key;
  }
}
