"use client";

import { LogoImage } from "@/components/elements/brand/brand";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import type { LinkHref } from "@/i18n/routing";
import { APP_VALUES, msg, type TranslationKey } from "@/lib/config/constants";
import { env } from "@/lib/config/env";
import type { IconName } from "@/lib/config/icon-map";
import { dayjs } from "@/lib/utils/format/date";
import { useTranslations } from "next-intl";
import NextLink from "next/link";

type FooterLink =
  | { label: TranslationKey; href: LinkHref }
  | { text: string; href: LinkHref }
  | { text: string; external: string };

// Labels without a translation key are plain English: only en is served.
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: msg("FOOTER.MODELS"), href: "/models" },
      { label: msg("FOOTER.PRICING"), href: "/pricing" },
      { text: "Chat", href: "/chat" },
      { label: msg("FOOTER.STATUS"), href: "/status" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: msg("FOOTER.DOCUMENTATION"), href: "/docs" },
      { text: "API keys", href: "/token" },
      ...(env.githubUrl
        ? [{ text: "Source code", external: env.githubUrl }]
        : []),
    ],
  },
  {
    title: "Legal",
    links: [
      { label: msg("FOOTER.TERMS"), href: "/terms" },
      { label: msg("FOOTER.PRIVACY"), href: "/privacy" },
      { label: msg("FOOTER.CONSENTS"), href: "/consents" },
      { label: msg("FOOTER.AUP"), href: "/aup" },
      { label: msg("FOOTER.REFUND"), href: "/refund" },
      { label: msg("FOOTER.IMPRESSUM"), href: "/impressum" },
    ],
  },
  {
    title: "Contact",
    links: [
      { text: env.supportEmail ?? "", external: `mailto:${env.supportEmail}` },
      ...(env.discordUrl
        ? [{ text: "Discord", external: env.discordUrl }]
        : []),
    ],
  },
];

const SOCIALS: { href?: string; icon: IconName; label: string }[] = [
  { href: env.githubUrl, icon: "brand-github", label: "GitHub" },
  { href: env.discordUrl, icon: "brand-discord", label: "Discord" },
  { href: env.twitterUrl, icon: "brand-x-twitter", label: "X" },
  { href: env.redditUrl, icon: "brand-reddit", label: "Reddit" },
  { href: env.youtubeUrl, icon: "brand-youtube", label: "YouTube" },
];

const linkClass =
  "text-primary-foreground text-base font-medium [overflow-wrap:anywhere] transition-opacity hover:opacity-70 sm:[overflow-wrap:normal]";

function FooterItem(props: { link: FooterLink }) {
  const t = useTranslations();
  const { link } = props;
  if ("external" in link) {
    return (
      <NextLink
        href={link.external}
        target={link.external.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={linkClass}
      >
        {link.text}
      </NextLink>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {"label" in link ? t(link.label) : link.text}
    </Link>
  );
}

// A full-bleed block in the brand colour with a large logo tile, after
// Browserbase's footer, rather than unorouter's rounded, glowing one.
export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-5">
            <LogoImage
              alt=""
              width={180}
              className="hidden rounded-[2.5rem] md:block"
            />
            <LogoImage alt="" width={88} className="rounded-2xl md:hidden" />
            <span className="text-4xl font-bold tracking-tight md:text-5xl">
              {APP_VALUES.appName}
            </span>
            <p className="max-w-xs text-base opacity-80">
              {t("FOOTER.DESCRIPTION")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="mb-3 font-mono text-xs tracking-widest uppercase opacity-70">
                  {column.title}
                </h2>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={"text" in link ? link.text : link.label}>
                      <FooterItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-primary-foreground/20 mt-16 flex flex-col gap-4 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 opacity-80">
            <p suppressHydrationWarning>
              {t("FOOTER.COPYRIGHT", {
                year:
                  (process.env.NEXT_PUBLIC_BUILD_DATE ?? "").slice(0, 4) ||
                  String(dayjs().year()),
                ...APP_VALUES,
              })}
            </p>
            {/* Required by the AGPL Section 7 terms in new-api's NOTICE. Keep it. */}
            <p>
              Frontend design and development by New API contributors.{" "}
              <NextLink
                href="https://github.com/QuantumNous/new-api"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
              >
                github.com/QuantumNous/new-api
              </NextLink>
            </p>
          </div>
          <div className="flex gap-4">
            {SOCIALS.map(
              (social) =>
                social.href && (
                  <NextLink
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="transition-opacity hover:opacity-70"
                  >
                    <Icon name={social.icon} className="size-5" />
                  </NextLink>
                ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
