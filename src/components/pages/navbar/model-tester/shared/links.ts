import { env } from "@/lib/config/env";

// AdoRouter: our org and repo, not upstream's.
const ORG = (env.githubUrl ?? "https://github.com/adorouter").replace(
  /\/+$/,
  "",
);
const REPO = `${ORG}/adorouter`;
// The detection engine lives in its own repo now, so "read the code" has to
// point there rather than at a path in this one.
const VERIFY_REPO = `${ORG}/verify-core`;

export const TESTER_LINKS = {
  discord: env.discordUrl ?? ORG,
  source: VERIFY_REPO,
  issuesNew: `${REPO}/issues/new`,
} as const;

export function githubReportUrl(host: string, model: string): string {
  const title = `Model tester dispute: ${host} / ${model}`;
  const body = `Endpoint: ${host}\nRequested model: ${model}\n\nWhy this result is wrong:\n`;
  return `${TESTER_LINKS.issuesNew}?title=${encodeURIComponent(
    title,
  )}&body=${encodeURIComponent(body)}`;
}
