import { adoMetadata } from "@/components/pages/ado/ado-metadata";
import { AdoPricing } from "@/components/pages/ado/ado-pricing";
import { getPlansData } from "@/lib/api/page-data";
import getQueryClient from "@/lib/react-query/client";
import { queryKeys } from "@/lib/react-query/keys";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  return adoMetadata(
    props,
    "/pricing",
    "Pricing",
    "Top up AdoRouter credits from $1, or subscribe.",
  );
}

export default async function Page() {
  // Seeded on the server so the amounts and plans show before hydration. A
  // gateway hiccup leaves them empty rather than breaking the page.
  const queryClient = getQueryClient();
  const [plans, topUpInfo] = await getPlansData().catch(
    () => [[], undefined] as const,
  );
  queryClient.setQueryData(queryKeys.subscriptionPlans(), plans ?? []);
  if (topUpInfo) queryClient.setQueryData(queryKeys.topUpInfo(), topUpInfo);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdoPricing />
    </HydrationBoundary>
  );
}
