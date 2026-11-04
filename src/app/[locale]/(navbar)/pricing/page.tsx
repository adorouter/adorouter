import { adoMetadata } from "@/components/pages/ado/ado-metadata";
import { AdoPricing } from "@/components/pages/ado/ado-pricing";
import { getSubscriptionPlansSummary } from "@/server/models/pricing/pricing.service";

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
  // A gateway hiccup shows "coming soon" rather than breaking the page.
  const plans = await getSubscriptionPlansSummary().catch(() => []);
  return <AdoPricing plans={plans ?? []} />;
}
