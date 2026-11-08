"use client";

import { Button } from "@/components/ui/button";
import { useAuthQuery } from "@/hooks/auth/auth-hook";
import { useHydrated } from "@/hooks/ui/use-hydrated";
import { Link } from "@/i18n/navigation";

// AdoRouter: the home page's main action. A signed-in visitor goes to the
// dashboard instead of being asked to create an account. Gated on hydration,
// like GetStartedLink, so the first client render matches the server's.
export function AdoPrimaryCta() {
  const authQuery = useAuthQuery();
  const hydrated = useHydrated();
  if (hydrated && authQuery.data)
    return (
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Go to dashboard
      </Button>
    );
  return (
    <Button nativeButton={false} render={<Link href="/register" />}>
      Create an account
    </Button>
  );
}
