import { notFound } from "next/navigation";

// AdoRouter: unknown addresses otherwise fall through to the root not-found,
// which is Next's bare "This page could not be found." with no navbar. Catching
// them here renders (navbar)/not-found.tsx inside the site layout instead.
// The title is set here as well as on not-found.tsx: Next streams this page's
// metadata after the first paint and it would otherwise replace the 404 title.
export const metadata = { title: "Page not found · AdoRouter" };

export default function UnknownPage() {
  notFound();
}
