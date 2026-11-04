import { Icon } from "@/components/ui/icon";
import { GuestActions } from "@/components/layout/nav/guest-actions";
import { UserDropdown } from "@/components/layout/user/user-dropdown";
import getQueryClient from "@/lib/react-query/client";
import { queryKeys } from "@/lib/react-query/keys";
import { prefetchAuth, prefetchElysia } from "@/lib/react-query/prefetch";
import { rpc } from "@/lib/rpc";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export async function NavAuth() {
  const queryClient = getQueryClient();

  await prefetchAuth(queryClient);
  const isLoggedIn = !!queryClient.getQueryData(queryKeys.auth());

  if (!isLoggedIn) {
    return <GuestActions />;
  }

  await prefetchElysia(queryClient, queryKeys.subscriptionSelf(), (cookies) =>
    rpc.api.billing.core["subscription-self"].get(cookies),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Explicit trigger id: written for a React 18 useId instability that
          19 fixed. Two SSR renders here now emit identical base-ui ids, so
          this is belt-and-braces, not load-bearing. */}
      <UserDropdown side="bottom" align="end" triggerId="nav-user-trigger">
        <button className="bg-muted hover:bg-muted/70 text-foreground flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none">
          {/* Deliberately NOT <UserAvatar />: it gates on the auth query, and
              HydrationBoundary defers an already-cached query to useEffect,
              which never runs during SSR, so the two sides can disagree on the
              null branch (React #418). This is also what TanStack advises for
              server components: prefetch there, do not render the query result.
              The RSC above already proved the user is logged in, so the icon
              needs no gate. */}
          <Icon name="user" className="size-4 shrink-0" />
        </button>
      </UserDropdown>
    </HydrationBoundary>
  );
}
