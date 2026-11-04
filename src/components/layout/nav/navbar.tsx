"use client";

import { CompanyName, LogoImage } from "@/components/elements/brand/brand";
import { NotifyBell } from "@/components/elements/notify/notify-bell";
import { Icon } from "@/components/ui/icon";
import { LanguageToggle } from "@/components/toggle/language-toggle";
import { ThemeToggle } from "@/components/toggle/theme-toggle";
import { useAuthQuery } from "@/hooks/auth/auth-hook";
import { useHydrated } from "@/hooks/ui/use-hydrated";
import { Link, usePathname } from "@/i18n/navigation";
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { GuestActions } from "./guest-actions";
import { MobileNav } from "./mobile-nav";
import { PrefetchLink } from "./prefetch-link";
import { isActiveLink, navigation } from "./navigation";

// A solid bar with the logo tile on the left, plain links in the middle and a
// pill button on the right, instead of unorouter's transparent bar of small
// uppercase monospace links. It stays 56px tall, which the pt-20 page padding
// expects.
export function Navbar(props: { authSlot?: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const authQuery = useAuthQuery();
  const hydrated = useHydrated();

  // Gate on hydrated or the first client render mismatches the logged-out shell.
  const navItems = navigation(hydrated && !!authQuery.data).filter(
    (item) => !item.hidden,
  );

  return (
    <nav className="bg-header border-border fixed top-0 right-0 left-0 z-50 border-b">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link
            href="/"
            prefetch={false}
            className="group flex items-center gap-2.5"
          >
            <LogoImage alt="" width={30} className="rounded-md" />
            <CompanyName className="text-foreground text-xl font-semibold tracking-tight" />
          </Link>
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {navItems.map((link) => {
            const active = isActiveLink(pathname, link.href, link.exact);
            return (
              <PrefetchLink
                key={link.name}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[15px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {t(link.name)}
              </PrefetchLink>
            );
          })}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {env.discordUrl && (
            <a
              href={env.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("NAV.DISCORD")}
              className="text-foreground/70 hover:text-foreground hidden p-1.5 transition-colors sm:block"
            >
              <Icon name="brand-discord" className="h-[18px] w-[18px]" />
            </a>
          )}
          <NotifyBell />
          <LanguageToggle />
          <ThemeToggle />
          <span className="bg-border mx-1 hidden h-5 w-px sm:block" />
          {props.authSlot ?? <GuestActions />}
        </div>
      </div>
    </nav>
  );
}
