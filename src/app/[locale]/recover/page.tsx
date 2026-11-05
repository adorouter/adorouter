import { AdoStandalone } from "@/components/pages/ado/ado-parts";
import { InlineRepairScript } from "@/components/elements/feedback/inline-repair";
import { getPageMetadata } from "@/lib/seo/metadata";
import { serverLocale } from "@/lib/utils/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await serverLocale(props);
  const t = await getTranslations({ locale });
  return getPageMetadata({
    locale,
    href: "/recover",
    title: t("MAIN.RECOVER.TITLE"),
    description: t("MAIN.RECOVER.DESCRIPTION"),
    keywords: t("METADATA.KEYWORDS"),
  });
}

// Server-rendered only, no client components: this page has to work while
// every chunk request hangs. It is precached by the service worker so the
// worker's own cache serves it in exactly that state.
export default async function RecoverPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await serverLocale(props);
  const t = await getTranslations({ locale });
  const next = `/${locale}/chat`;
  return (
    <>
      <AdoStandalone
        title={t("MAIN.RECOVER.TITLE")}
        description={t("MAIN.RECOVER.DESCRIPTION")}
      >
        <a
          href={next}
          className="border-border hover:border-foreground/40 inline-flex items-center rounded-full border px-5 py-2.5 font-semibold transition-colors"
        >
          {t("MAIN.ACTIONS.TRY_AGAIN")}
        </a>
      </AdoStandalone>
      <InlineRepairScript auto={next} />
    </>
  );
}
