"use client";

import { sidebarNavigation } from "@/components/layout/nav/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { useLogoutMutation } from "@/hooks/auth/auth-hook";
import { useSubscriptionSelfQuery } from "@/hooks/billing/billing-hook";
import { useUserDisplay } from "@/hooks/ui/user-display-hook";
import { Link } from "@/i18n/navigation";
import { quotaToDollars } from "@/lib/config/constants";
import { useTranslations } from "next-intl";
import { ReactElement } from "react";
import { DataSubmenu } from "./data-submenu";

interface UserDropdownProps {
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  triggerId?: string;
}

const label =
  "text-muted-foreground font-mono text-[11px] tracking-widest uppercase";

// AdoRouter: our own account menu (2026-11-07): identity, a balance card with
// a top up action, the account pages as a two-column grid, then data and log
// out on one footer row. Upstream's was a plain list under a profile row.
export function UserDropdown(props: UserDropdownProps) {
  const t = useTranslations();
  const userDisplay = useUserDisplay();
  const logoutMutation = useLogoutMutation();
  const subQuery = useSubscriptionSelfQuery();

  const activeSubs = (subQuery.data?.subscriptions ?? []).flatMap((s) =>
    s.subscription?.status === "active"
      ? [{ ...s, subscription: s.subscription }]
      : [],
  );

  if (!userDisplay.user) return null;

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      window.location.reload();
    } catch {}
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={props.triggerId}
        className={props.className}
        render={props.children}
      ></DropdownMenuTrigger>
      <DropdownMenuContent
        side={props.side ?? "bottom"}
        align={props.align ?? "end"}
        sideOffset={props.sideOffset ?? 8}
        className="w-72 rounded-2xl p-0"
      >
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold">
            {userDisplay.initials}
          </span>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              {userDisplay.displayName}
            </p>
            {userDisplay.roleKey && (
              <p className={label}>{t(userDisplay.roleKey)}</p>
            )}
          </div>
        </div>

        {userDisplay.balanceDisplay && (
          <div className="border-border bg-muted/40 mx-3 flex items-end justify-between gap-3 rounded-xl border p-3">
            <div className="min-w-0">
              <p className={label}>{t("AUTH.MENU.BALANCE")}</p>
              <p className="text-foreground mt-0.5 truncate text-2xl font-semibold tabular-nums">
                {userDisplay.balanceDisplay}
              </p>
            </div>
            <DropdownMenuItem
              render={<Link href="/billing" />}
              className="bg-primary text-primary-foreground focus:bg-primary/85 focus:text-primary-foreground not-data-[variant=destructive]:focus:**:text-primary-foreground h-8 shrink-0 rounded-full px-3.5 text-xs font-semibold"
            >
              {t("AUTH.MENU.TOP_UP")}
            </DropdownMenuItem>
          </div>
        )}

        {activeSubs.length > 0 && (
          <div className="mx-3 mt-2 flex flex-col gap-2 rounded-xl border p-3">
            <p className={label}>
              {t("AUTH.SUBSCRIPTION")} · {t("AUTH.SUBSCRIPTION_ACTIVE")}
            </p>
            {activeSubs.map((summary) => {
              const sub = summary.subscription;
              const total = quotaToDollars(sub.amount_total);
              const used = quotaToDollars(sub.amount_used);
              const percentage =
                total > 0 ? Math.min((used / total) * 100, 100) : 0;
              const title = summary.plan_title || `#${sub.plan_id}`;
              return (
                <div key={sub.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-foreground truncate">{title}</span>
                    {total > 0 && (
                      <span className="text-muted-foreground ml-auto font-mono tabular-nums">
                        ${used.toFixed(2)} / ${total.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {total > 0 && (
                    <Progress value={percentage} className="h-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1 p-3">
          {sidebarNavigation(
            (userDisplay.user?.topup_bonus_percent ?? 0) > 0,
          ).map((item) => (
            <DropdownMenuItem
              key={String(item.href)}
              render={<Link href={item.href} />}
              className="border-border/60 hover:border-border min-w-0 gap-2 rounded-xl border px-2.5 py-2 text-xs"
            >
              {item.iconName && (
                <Icon name={item.iconName} className="text-muted-foreground" />
              )}
              {item.iconComponent && <item.iconComponent />}
              <span className="truncate">{t(item.name)}</span>
            </DropdownMenuItem>
          ))}
        </div>

        <div className="border-border flex items-center gap-1 border-t p-1.5">
          <div className="min-w-0 flex-1">
            <DataSubmenu />
          </div>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="shrink-0 pr-3 text-xs"
          >
            <Icon name="log-out" />
            {t("AUTH.MENU.LOG_OUT")}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
