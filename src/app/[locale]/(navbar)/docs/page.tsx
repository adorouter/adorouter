import { AdoDocs } from "@/components/pages/ado/ado-marketing";
import { adoMetadata } from "@/components/pages/ado/ado-metadata";

export function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  return adoMetadata(props, "/docs", "Docs", "How to use the adorouter API.");
}

export default function Page() {
  return <AdoDocs />;
}
