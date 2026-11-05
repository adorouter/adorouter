import { ContentBoundary } from "@/components/elements/feedback/content-boundary";
import { AccountTabs } from "@/components/layout/account/account-tabs";
import { Footer } from "@/components/layout/nav/footer";
import { NavAuth } from "@/components/layout/nav/nav-auth";
import { Navbar } from "@/components/layout/nav/navbar";
import { TermsAcceptanceGate } from "@/components/pages/auth/terms-acceptance-gate";
import { AuthRedirectCleanup } from "@/components/provider/app/auth-redirect-cleanup";
import { APP_VALUES } from "@/lib/config/constants";
import { rpc } from "@/lib/rpc";
import { getPageMetadata } from "@/lib/seo/metadata";
import { redirectToLogin, serverLocale } from "@/lib/utils/server";
import getQueryClient from "@/lib/react-query/client";
import { queryKeys } from "@/lib/react-query/keys";
import { prefetchAuth, prefetchElysia } from "@/lib/react-query/prefetch";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await serverLocale(props);
  const t = await getTranslations({ locale });
  return getPageMetadata({
    locale,
    href: "/dashboard",
    title: t("METADATA.ACCOUNT.TITLE", APP_VALUES),
    description: t("METADATA.ACCOUNT.DESC", APP_VALUES),
    keywords: t("METADATA.ACCOUNT.KEYWORDS", APP_VALUES),
    robots: false,
  });
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const queryClient = getQueryClient();
  const expired = await prefetchAuth(queryClient);
  if (!queryClient.getQueryData(queryKeys.auth()))
    await redirectToLogin({ expired });

  await prefetchElysia(queryClient, queryKeys.subscriptionSelf(), (cookies) =>
    rpc.api.billing.core["subscription-self"].get(cookies),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* AdoRouter: the site navbar plus a row of account tabs, instead of
          unorouter's sidebar shell. Chat keeps the sidebar for its
          conversation list. */}
      <AuthRedirectCleanup />
      <TermsAcceptanceGate />
      <Navbar authSlot={<NavAuth />} />
      <div className="bg-background flex flex-1 flex-col pt-14">
        <AccountTabs />
        <main className="flex min-w-0 flex-1">
          <ContentBoundary className="pt-10 pb-24">
            {props.children}
          </ContentBoundary>
        </main>
      </div>
      <div className="bg-background">
        <Footer />
      </div>
    </HydrationBoundary>
  );
}
