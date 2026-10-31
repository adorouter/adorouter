import {
  LegalDoc,
  type LegalDocSection,
} from "@/components/pages/legal/legal-doc";
import { env } from "@/lib/config/env";

// A number only applies if the business is VAT registered, so no number means no section.
// Likewise the operator's details, which are filled in before launch.
const SECTIONS: LegalDocSection[] = [
  ...(env.legalName
    ? [
        {
          title: "PROVIDER_TITLE",
          para: { key: "PROVIDER_CONTENT", values: true as const },
        },
      ]
    : []),
  { title: "CONTACT_TITLE", para: { key: "CONTACT_CONTENT", values: true } },
  ...(env.legalVatId
    ? [
        {
          title: "VAT_TITLE",
          para: { key: "VAT_CONTENT", values: true as const },
        },
      ]
    : []),
  { title: "DISPUTE_TITLE", para: { key: "DISPUTE_CONTENT" } },
];

export function ImpressumContent() {
  return <LegalDoc ns="IMPRESSUM" sections={SECTIONS} />;
}
