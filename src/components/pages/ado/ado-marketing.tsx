import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { env } from "@/lib/config/env";
import { AdoCode, AdoList, AdoPage, AdoSection } from "./ado-parts";
import { AdoPrimaryCta } from "./ado-primary-cta";

const chatExample = (baseUrl: string) => `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer $ADOROUTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-flash",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'`;

const pythonExample = (baseUrl: string) => `from openai import OpenAI
import os

client = OpenAI(
    base_url="${baseUrl}/v1",
    api_key=os.environ["ADOROUTER_API_KEY"],
)

reply = client.chat.completions.create(
    model="deepseek-flash",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(reply.choices[0].message.content)`;

export function AdoHome() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 pt-36 pb-24">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
        One key for your AI models
      </h1>
      <p className="text-foreground/80 mt-6 max-w-2xl text-xl leading-relaxed">
        AdoRouter is an OpenAI-compatible API. Top up credits, create a key, and
        change one line in your code. You only pay for what you use.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <AdoPrimaryCta />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/models" />}
        >
          See models and prices
        </Button>
      </div>

      <div className="mt-20 grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-lg font-semibold">Pay as you go</h2>
          <p className="text-foreground/70 mt-2 leading-relaxed">
            Top up from $1. Credits you buy never expire.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Works with your tools</h2>
          <p className="text-foreground/70 mt-2 leading-relaxed">
            Use any client that lets you set an OpenAI-compatible base URL.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Your prompts stay yours</h2>
          <p className="text-foreground/70 mt-2 leading-relaxed">
            We don&apos;t store your prompts or responses, and we use no
            trackers.
          </p>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Make your first request
        </h2>
        <AdoCode>{chatExample(env.apiUrl)}</AdoCode>
      </div>
    </main>
  );
}

export function AdoDocs() {
  return (
    <AdoPage
      title="Docs"
      intro="AdoRouter is OpenAI-compatible, so most tools only need a base URL and a key."
    >
      <AdoSection title="Quick start">
        <AdoList
          items={[
            "Create an account with an email and password, or sign in with GitHub, Google or Discord.",
            <>
              Give your consent on the{" "}
              <Link href="/consents" className="text-primary hover:underline">
                Consents page
              </Link>{" "}
              for providers outside the EU. Requests are refused until you do.
            </>,
            <>
              Create a key on the{" "}
              <Link href="/token" className="text-primary hover:underline">
                API keys page
              </Link>
              , and keep it private.
            </>,
            <>
              Top up on the{" "}
              <Link href="/billing" className="text-primary hover:underline">
                Billing page
              </Link>{" "}
              if you need more credit.
            </>,
            <>
              Pick a model on the{" "}
              <Link href="/models" className="text-primary hover:underline">
                Models page
              </Link>{" "}
              and send a request.
            </>,
          ]}
        />
      </AdoSection>
      <AdoSection title="Base URL and key">
        <AdoCode>{`${env.apiUrl}/v1`}</AdoCode>
        <p>Send your key in the Authorization header as a Bearer token.</p>
      </AdoSection>
      <AdoSection title="cURL">
        <AdoCode>{chatExample(env.apiUrl)}</AdoCode>
      </AdoSection>
      <AdoSection title="Python">
        <AdoCode>{pythonExample(env.apiUrl)}</AdoCode>
      </AdoSection>
      <AdoSection title="Endpoints">
        <AdoList
          items={[
            "POST /v1/chat/completions, streaming included",
            "POST /v1/completions",
            "POST /v1/responses",
            "POST /v1/messages (Anthropic format)",
            "POST /v1/embeddings, if a model supports it",
            "GET /v1/models",
          ]}
        />
        <p>
          AdoRouter serves text models only for now. Image, video and audio
          endpoints return a 404 with the code{" "}
          <code className="font-mono text-sm">ENDPOINT_NOT_AVAILABLE</code>.
        </p>
      </AdoSection>
      <AdoSection title="Costs">
        <p>
          Your balance goes down by each request&apos;s cost, and your usage
          logs show what each one cost. See{" "}
          <Link href="/pricing" className="text-primary hover:underline">
            Pricing
          </Link>
          .
        </p>
      </AdoSection>
      <AdoSection title="Help">
        <p>
          Ask on our Discord server, or email{" "}
          <a
            href={`mailto:${env.supportEmail}`}
            className="text-primary hover:underline"
          >
            {env.supportEmail}
          </a>
          .
        </p>
      </AdoSection>
    </AdoPage>
  );
}
