import type { Pathname } from "@/i18n/routing";
import { getPageMetadata } from "@/lib/seo/metadata";
import { serverLocale } from "@/lib/utils/server";

export async function adoMetadata(
  props: { params: Promise<{ locale: string }> },
  href: Pathname,
  title: string,
  description: string,
) {
  const locale = await serverLocale(props);
  return getPageMetadata({
    locale,
    href,
    title: href === "/" ? title : `${title} · AdoRouter`,
    description,
    keywords: "",
  });
}
