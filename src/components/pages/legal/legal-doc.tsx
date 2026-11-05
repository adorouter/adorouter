import { Link } from "@/i18n/navigation";
import { APP_VALUES } from "@/lib/config/constants";
import { env } from "@/lib/config/env";
import type { TranslationKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { Fragment } from "react";

type LegalNs = "AUP" | "IMPRESSUM" | "PRIVACY" | "REFUND" | "TERMS";

type LegalPara = { key: string; values?: true };

export type LegalDocSection = {
  title: string;
  para?: LegalPara;
  intro?: LegalPara;
  items?: string[];
  outro?: LegalPara;
  subs?: { title: string; para: string }[];
};

// Order of the tab row shared by every legal page.
const LEGAL_PAGES: {
  ns: LegalNs;
  href: "/terms" | "/privacy" | "/refund" | "/aup" | "/impressum";
}[] = [
  { ns: "TERMS", href: "/terms" },
  { ns: "PRIVACY", href: "/privacy" },
  { ns: "REFUND", href: "/refund" },
  { ns: "AUP", href: "/aup" },
  { ns: "IMPRESSUM", href: "/impressum" },
];

// Most translated titles carry their own number ("1. Service Overview") but
// some don't, so strip it and number the sections here instead.
const unnumbered = (title: string) => title.replace(/^\d+\.\s*/, "");

const anchor = (title: string) =>
  title
    .replace(/_TITLE$/, "")
    .toLowerCase()
    .replace(/_/g, "-");

// AdoRouter layout: a tab row linking every legal page, a sticky contents list
// on wide screens and numbered sections. The text itself stays in the
// translation files, which the promise tests read.
export async function LegalDoc(props: {
  ns: LegalNs;
  sections: LegalDocSection[];
}) {
  const t = await getTranslations();
  const key = (leaf: string) => `${props.ns}.${leaf}` as TranslationKey;
  const values = {
    ...APP_VALUES,
    discordUrl: env.discordUrl ?? "",
    legalName: env.legalName,
    legalAddress: env.legalAddress,
    vatId: env.legalVatId,
  };
  const para = (p: LegalPara) =>
    p.values ? t(key(p.key), values) : t(key(p.key));
  const updated = t(key("LAST_UPDATED")).replace(/^Last Updated:\s*/i, "");

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-28 pb-20">
      <nav
        aria-label="Legal pages"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
      >
        {LEGAL_PAGES.map((page) => {
          const active = page.ns === props.ns;
          return (
            <Link
              key={page.ns}
              href={page.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-foreground/80 hover:border-foreground/40",
              )}
            >
              {t(`${page.ns}.TITLE` as TranslationKey)}
            </Link>
          );
        })}
      </nav>

      <header className="border-border mt-10 border-b pb-10">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {t(key("TITLE"))}
        </h1>
        <p className="text-muted-foreground mt-3">Last updated {updated}</p>
        <p className="text-foreground/80 mt-6 max-w-3xl text-lg leading-relaxed">
          {t(key("INTRO"), APP_VALUES)}
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              On this page
            </p>
            <ol className="mt-4 space-y-2 text-sm">
              {props.sections.map((s) => (
                <li key={s.title}>
                  <a
                    href={`#${anchor(s.title)}`}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {unnumbered(t(key(s.title)))}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="max-w-3xl space-y-10">
          {props.sections.map((s, i) => (
            <section
              key={s.title}
              id={anchor(s.title)}
              className="scroll-mt-24"
            >
              <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight">
                <span className="text-primary font-mono text-sm tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {unnumbered(t(key(s.title)))}
              </h2>
              <div className="text-foreground/80 mt-3 space-y-3 leading-relaxed">
                {s.subs?.map((sub) => (
                  <Fragment key={sub.title}>
                    <h3 className="text-foreground pt-1 font-medium">
                      {t(key(sub.title))}
                    </h3>
                    <p>{t(key(sub.para))}</p>
                  </Fragment>
                ))}
                {s.para && (
                  <p className="whitespace-pre-line">{para(s.para)}</p>
                )}
                {s.intro && <p>{para(s.intro)}</p>}
                {s.items && (
                  <ul className="list-disc space-y-2 pl-5">
                    {s.items.map((item) => (
                      <li key={item}>{t(key(item))}</li>
                    ))}
                  </ul>
                )}
                {s.outro && <p>{para(s.outro)}</p>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
