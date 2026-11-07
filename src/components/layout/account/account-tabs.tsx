"use client";

import { PrefetchLink } from "@/components/layout/nav/prefetch-link";
import {
  isActiveLink,
  sidebarNavigation,
} from "@/components/layout/nav/navigation";
import { useAuthQuery } from "@/hooks/auth/auth-hook";
import { usePathname } from "@/i18n/navigation";
import { APP_VALUES } from "@/lib/config/constants";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// AdoRouter: the account pages sit under the site navbar with this row of
// tabs, instead of unorouter's collapsible left sidebar. Consents is a public
// page with its own layout, so its tab leaves this shell.
export function AccountTabs() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: user } = useAuthQuery();
  // A negotiated top-up bonus is what marks an enterprise partner account.
  const isPartner = (user?.topup_bonus_percent ?? 0) > 0;
  const items = sidebarNavigation(isPartner).filter((item) => !item.hidden);

  return (
    <div className="bg-background/95 border-border sticky top-14 z-40 border-b backdrop-blur">
      <nav
        aria-label="Account"
        className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6"
      >
        {items.map((item) => {
          const active = isActiveLink(pathname, item.href, item.exact);
          return (
            <PrefetchLink
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3 py-3 text-[15px] font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "text-foreground/70 hover:text-foreground border-transparent",
              )}
            >
              {t(item.name, APP_VALUES)}
            </PrefetchLink>
          );
        })}
      </nav>
    </div>
  );
}

// Pill styling for in-page <Tabs> on account pages, matching the chips on the
// public pages. Pass to TabsList / TabsTrigger as className.
export const PILL_TABS_LIST =
  "h-auto flex-wrap justify-start gap-2 bg-transparent p-0";
export const PILL_TABS_TRIGGER =
  "border-border text-foreground/80 hover:border-foreground/40 h-auto flex-none rounded-full px-4 py-1.5 after:hidden data-active:border-foreground data-active:bg-foreground data-active:text-background dark:data-active:border-foreground dark:data-active:bg-foreground dark:data-active:text-background";
