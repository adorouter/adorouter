import { AdoPricing } from "@/components/pages/ado/ado-marketing";
import { adoMetadata } from "@/components/pages/ado/ado-metadata";

export function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  return adoMetadata(props, "/pricing", "Pricing", "Prepaid credits with no subscription. Pay for the tokens you use.");
}

export default function Page() {
  return <AdoPricing />;
}
