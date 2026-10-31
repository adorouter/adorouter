import { env } from "@/lib/config/env";
import type { ReactNode } from "react";

// Shared layout for adorouter's own pages. These pages are English only and live
// outside the translation files so upstream merges don't overwrite them.

export function AdoPage(props: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-28 pb-20">
      <h1 className="text-4xl font-bold tracking-tight">{props.title}</h1>
      {props.updated && (
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated {props.updated}
        </p>
      )}
      {props.intro && (
        <p className="text-foreground/80 mt-4 text-lg leading-relaxed">
          {props.intro}
        </p>
      )}
      <div className="mt-10 space-y-10">{props.children}</div>
    </main>
  );
}

export function AdoSection(props: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2>
      <div className="text-foreground/80 space-y-3 leading-relaxed">
        {props.children}
      </div>
    </section>
  );
}

export function AdoList(props: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {props.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function AdoCode(props: { children: string }) {
  return (
    <pre className="bg-card overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed">
      <code>{props.children}</code>
    </pre>
  );
}

export function AdoDiscordLink() {
  if (!env.discordUrl) return <>our Discord server</>;
  return (
    <a
      href={env.discordUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      our Discord server
    </a>
  );
}

export function AdoSupportEmail() {
  return (
    <a
      href={`mailto:${env.supportEmail}`}
      className="text-primary hover:underline"
    >
      {env.supportEmail}
    </a>
  );
}
