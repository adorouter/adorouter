import { AdoHome } from "@/components/pages/ado/ado-marketing";
import { adoMetadata } from "@/components/pages/ado/ado-metadata";

export function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  return adoMetadata(props, "/", "AdoRouter", "One OpenAI-compatible key for your AI models, paid for with prepaid credits.");
}

export default function Page() {
  return <AdoHome />;
}
