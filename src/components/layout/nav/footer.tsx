"use client";

import { CompanyName, LogoImage } from "@/components/elements/brand/brand";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { APP_VALUES, msg } from "@/lib/config/constants";
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils";
import { dayjs } from "@/lib/utils/format/date";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { isActiveLink } from "./navigation";

const NAV_LINKS = [
  { href: "/models", key: msg("FOOTER.MODELS") },
  { href: "/pricing", key: msg("FOOTER.PRICING") },
  { href: "/docs", key: msg("FOOTER.DOCUMENTATION") },
] as const;

const LEGAL_LINKS = [
  { href: "/terms", key: msg("FOOTER.TERMS") },
  { href: "/privacy", key: msg("FOOTER.PRIVACY") },
  { href: "/consents", key: msg("FOOTER.CONSENTS") },
  { href: "/aup", key: msg("FOOTER.AUP") },
  { href: "/refund", key: msg("FOOTER.REFUND") },
  { href: "/impressum", key: msg("FOOTER.IMPRESSUM") },
] as const;

function FooterLinks(props: {
  links: typeof NAV_LINKS | typeof LEGAL_LINKS;
  pathname: string;
}) {
  const t = useTranslations();
  return (
    <>
      {props.links.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className={cn(
              "text-foreground/70 hover:text-foreground transition-colors",
              isActiveLink(props.pathname, item.href) &&
                "text-primary font-medium",
            )}
          >
            {t(item.key)}
          </Link>
        </li>
      ))}
    </>
  );
}

export function Footer() {
  const t = useTranslations();
  const pathname = usePathname();

  const socialLinks = [
    {
      id: "github",
      href: env.githubUrl,
      icon: "brand-github",
      label: "GitHub",
    },
    {
      id: "discord",
      href: env.discordUrl,
      icon: "brand-discord",
      label: "Discord",
    },
    { id: "x", href: env.twitterUrl, icon: "brand-x-twitter", label: "X" },
    {
      id: "trustpilot",
      href: env.trustpilotUrl,
      icon: "brand-trustpilot",
      label: "Trustpilot",
    },
    {
      id: "reddit",
      href: env.redditUrl,
      icon: "brand-reddit",
      label: "Reddit",
    },
    {
      id: "telegram",
      href: env.telegramUrl,
      icon: "brand-telegram",
      label: "Telegram",
    },
    {
      id: "youtube",
      href: env.youtubeUrl,
      icon: "brand-youtube",
      label: "YouTube",
    },
    {
      id: "instagram",
      href: env.instagramUrl,
      icon: "brand-instagram",
      label: "Instagram",
    },
  ] as const;

  return (
    <footer className="bg-footer relative overflow-hidden rounded-t-3xl border-t md:rounded-t-[4rem]">
      <div className="absolute inset-0 -z-10">
        <div className="bg-primary/30 dark:bg-primary/10 absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl"></div>
        <div className="bg-primary/30 dark:bg-primary/10 absolute top-1/4 right-0 h-72 w-72 rounded-full blur-3xl"></div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="col-span-1 text-center md:col-span-2 md:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
              <LogoImage alt="" />
              <CompanyName className="text-2xl" />
            </div>
            <p className="text-foreground/70 mx-auto mb-6 max-w-md md:mx-0">
              {t("FOOTER.DESCRIPTION")}
            </p>
            <div className="flex justify-center space-x-3 md:justify-start">
              {socialLinks.map(
                (social) =>
                  social.href && (
                    <NextLink
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-background hover:bg-muted rounded-full p-2 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon name={social.icon} className="h-5 w-5" />
                    </NextLink>
                  ),
              )}
            </div>
          </div>

          <div className="col-span-1 flex justify-center gap-8 md:contents">
            <div className="text-center md:col-span-1 md:text-left">
              <h2 className="mb-4 font-semibold">{t("FOOTER.PRODUCT")}</h2>
              <ul className="space-y-2">
                <FooterLinks links={NAV_LINKS} pathname={pathname} />
                <li>
                  <Link
                    href="/status"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {t("FOOTER.STATUS")}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center md:col-span-1 md:text-left">
              <h2 className="mb-4 font-semibold">{t("FOOTER.LEGAL")}</h2>
              <ul className="space-y-2">
                <FooterLinks links={LEGAL_LINKS} pathname={pathname} />
              </ul>
            </div>
          </div>

          <div className="col-span-1 text-center md:text-left">
            <h2 className="mb-4 font-semibold">{t("FOOTER.CONTACT_TITLE")}</h2>
            <div className="text-foreground/70 space-y-2 text-sm">
              <p>{t("FOOTER.CONTACT_SUBTITLE")}</p>
              <NextLink
                href={`mailto:${env.supportEmail}`}
                className="text-primary hover:underline"
              >
                {env.supportEmail}
              </NextLink>
            </div>
          </div>
        </div>

        <div className="border-muted/50 relative border-t pt-8">
          <div className="via-primary/70 absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent"></div>
          <div className="text-foreground/70 relative flex flex-col items-center justify-center gap-2 text-sm">
            <p className="text-center" suppressHydrationWarning>
              {t("FOOTER.COPYRIGHT", {
                year:
                  (process.env.NEXT_PUBLIC_BUILD_DATE ?? "").slice(0, 4) ||
                  String(dayjs().year()),
                ...APP_VALUES,
              })}
            </p>
            {/* Required by the AGPL Section 7 terms in new-api's NOTICE. Keep it. */}
            <p className="text-center text-xs">
              Frontend design and development by New API contributors.{" "}
              <NextLink
                href="https://github.com/QuantumNous/new-api"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline"
              >
                github.com/QuantumNous/new-api
              </NextLink>
              {" · "}
              <NextLink
                href="https://github.com/adorouter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline"
              >
                Source code
              </NextLink>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
