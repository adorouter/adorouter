import type { IntegrationIconKey } from "@/components/pages/docs/integration-types";
import type { LinkHref } from "@/i18n/routing";
import { TranslationKey } from "@/lib/config/constants";
import type { IconName } from "@/lib/config/icon-map";
import type { ComponentType } from "react";

export type NavigationItem = {
  name: TranslationKey;
  subtitle?: TranslationKey;
  href: LinkHref;
  iconName?: IconName;
  iconComponent?: ComponentType<{ className?: string }>;
  guideIcon?: {
    iconKey: IntegrationIconKey;
    logoSrc?: string;
    logoBg?: boolean;
    logoMono?: boolean;
  };
  hidden?: boolean;
  exact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  submenu?: NavigationItem[];
  group?: TranslationKey;
};

const fillParams = (path: string, params?: Record<string, unknown>) => {
  if (!params) return path;
  let out = path;
  for (const [key, value] of Object.entries(params)) {
    out = out.replace(`[${key}]`, String(value));
  }
  return out;
};

const resolveHref = (href: LinkHref) => {
  if (typeof href === "string") return href;
  const hrefParams = "params" in href && href.params ? href.params : undefined;
  return fillParams(href.pathname, hrefParams);
};

export const isActiveLink = (
  pathname: string,
  href: LinkHref,
  exact?: boolean,
  routeParams?: Record<string, unknown>,
) => {
  const cleanPathname =
    fillParams(pathname, routeParams).replace(/\/$/, "") || "/";
  const cleanHref = resolveHref(href).replace(/\/$/, "") || "/";

  if (exact || cleanHref === "/") {
    return cleanPathname === cleanHref;
  }

  return (
    cleanPathname === cleanHref || cleanPathname.startsWith(cleanHref + "/")
  );
};

export const navigation = (authenticated?: boolean): NavigationItem[] => [
  { name: "NAV.HOME", href: "/", iconName: "house", hidden: true },
  {
    name: "NAV.DASHBOARD",
    href: "/dashboard",
    iconName: "layout-dashboard",
    hidden: !authenticated,
  },
  { name: "NAV.MODELS", href: "/models", iconName: "layers" },
  { name: "NAV.PRICING", href: "/pricing", iconName: "dollar-sign" },
  { name: "NAV.CHAT", href: "/chat", iconName: "message-circle", exact: true },
  { name: "NAV.DOCS", href: "/docs", iconName: "book-open", exact: true },
];

// isPartner gates the enterprise gift-card section. Presentation only: the
// upstream API refuses a non-partner regardless of what the sidebar renders.
// The entry is omitted rather than flagged `hidden`, because callers here render
// the list as-is; only one of the three filters on `hidden`.
export const sidebarNavigation = (isPartner = false): NavigationItem[] => {
  const items: (NavigationItem | false)[] = [
    {
      name: "SIDEBAR.DASHBOARD",
      href: "/dashboard",
      iconName: "layout-dashboard",
    },
    {
      name: "SIDEBAR.TOKENS",
      href: "/token",
      iconName: "key",
    },
    {
      name: "SIDEBAR.LOGS",
      href: "/logs",
      iconName: "scroll-text",
    },
    {
      name: "SIDEBAR.BILLING",
      href: "/billing",
      iconName: "wallet",
    },
    {
      name: "SIDEBAR.AFFILIATE",
      href: "/affiliate",
      iconName: "gift",
    },
    isPartner && {
      name: "SIDEBAR.GIFT_CARDS",
      href: "/gift-cards",
      iconName: "ticket",
    },
    {
      name: "SIDEBAR.SETTINGS",
      href: "/settings",
      iconName: "settings",
    },
    {
      name: "SIDEBAR.CONSENTS",
      href: "/consents",
      iconName: "shield-check",
    },
  ];
  return items.filter((item) => item !== false);
};
