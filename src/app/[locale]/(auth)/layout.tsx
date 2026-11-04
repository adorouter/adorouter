import { CompanyName, LogoImage } from "@/components/elements/brand/brand";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import getQueryClient from "@/lib/react-query/client";
import { queryKeys } from "@/lib/react-query/keys";
import { prefetchAuth, prefetchElysia } from "@/lib/react-query/prefetch";
import { rpc } from "@/lib/rpc";
import { redirectFromAuth } from "@/lib/utils/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// Each point must stay true: Pricing, Terms and the promises tests back them.
const POINTS = [
  "Prepaid credits from $1 that never expire",
  "One balance for every model we offer",
  "We don't store your prompts or responses",
];

// A split screen: a brand-colour panel on the left (wide screens only) and the
// form on the right, instead of unorouter's single centred card.
export default async function AuthLayout(props: Props) {
  const t = await getTranslations();
  const queryClient = getQueryClient();

  await prefetchAuth(queryClient);
  if (queryClient.getQueryData(queryKeys.auth())) await redirectFromAuth();

  await prefetchElysia(queryClient, queryKeys.status(), () =>
    rpc.api.auth.account.status.get(),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="bg-background grid min-h-dvh lg:grid-cols-2">
        <aside className="bg-primary text-primary-foreground hidden flex-col justify-between p-12 lg:flex">
          <Link href="/" className="flex items-center gap-3">
            <LogoImage width={44} priority className="rounded-xl" />
            <CompanyName className="text-2xl" />
          </Link>

          <div className="max-w-md space-y-8">
            <h2 className="text-5xl leading-tight font-bold tracking-tight">
              One key for your AI models.
            </h2>
            <ul className="space-y-4 text-lg">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Icon name="check" className="mt-1 size-5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm opacity-80">
            <Link href="/terms" className="hover:underline">
              {t("FOOTER.LEGAL_TERMS")}
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">
              {t("FOOTER.LEGAL_PRIVACY")}
            </Link>
          </p>
        </aside>

        <div className="flex flex-col px-5 py-8 sm:px-10">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <LogoImage width={32} priority className="rounded-lg" />
            <CompanyName className="text-foreground text-lg" />
          </Link>

          <div className="flex flex-1 items-center justify-center py-10">
            {props.children}
          </div>

          <p className="text-muted-foreground text-center text-xs lg:hidden">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("FOOTER.LEGAL_TERMS")}
            </Link>
            {" · "}
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("FOOTER.LEGAL_PRIVACY")}
            </Link>
          </p>
        </div>
      </main>
    </HydrationBoundary>
  );
}
