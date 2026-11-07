> AdoRouter modified this software, most recently on 2026-11-01. It is based on unorouter (https://github.com/unorouter/unorouter), which builds on new-api by QuantumNous (https://github.com/QuantumNous/new-api). Both are AGPL-3.0, and so is this version. See [NOTICE](NOTICE).

# AdoRouter

Website and dashboard for the AdoRouter AI gateway, a `new-api` fork with prepaid credits and an OpenAI-compatible API. Next.js 16 + Elysia BFF on Bun. AGPL-3.0.

Surfaces:

- **Gateway dashboard**: API keys, usage logs, billing, credits, affiliate, model catalog, status page.
- **Chat**: a plain chat for signed-in users at `/chat`. Catalog models go through a same-origin proxy, so the upstream token never reaches the browser, and replies aren't stored on the server.

Chat history lives in ONE SQLocal/OPFS database per device in the browser, and that copy is the only copy. Cross-device transfer is export/import.

## Stack

Next.js 16, React 19 compiler, Tailwind v4, shadcn/ui, Jotai, React Query 5, nuqs, next-intl (18 locales). Elysia, TypeBox, Eden Treaty, Orval-generated upstream client. Drizzle over SQLocal (opfs-sahpool) and libSQL. Vercel AI SDK, assistant-ui. Serwist service worker. Pino.

## Layout

```
src/app/[locale]/(auth|chat|navbar|sidebar|status)   route groups
src/server/{ai,auth,billing,models,ops}              BFF domains: route.ts -> *.service.ts
src/lib/ai/chat                                      isomorphic chat engine (runs in the browser)
src/lib/db/{client,server,schema}                    SQLocal + libSQL, shared schema
src/i18n/messages                                    English messages (bundled, not served)
```

## Develop

```bash
cp .env.example .env    # SYSTEM_ACCESS_TOKEN and SESSION_SECRET (>= 32 chars) are required
bun install
bun dev:log             # dev server, logs to /tmp/next.log
bun typecheck && bun lint
bun openapi             # regenerate src/openapi.ts from the upstream spec
bun db:generate         # Drizzle migrations for both DBs, bundled for SQLocal
```

Deploy: a push to `main` builds the image (GHCR), and the server runs the commit pinned in its `.env`. See the `infra` repo.
