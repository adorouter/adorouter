import { getTranslations } from "next-intl/server";

export async function ChatWelcomePlaceholder() {
  const t = await getTranslations();
  return (
    <div className="chat-welcome-placeholder bg-background pointer-events-none absolute inset-0 z-10 flex flex-col">
      {/* Same heading as ThreadWelcome in thread.tsx, so nothing jumps
          when the client takes over. */}
      <div className="mx-auto flex w-full max-w-176 flex-1 flex-col justify-center px-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {t("CHAT.EMPTY_TITLE")}
        </h1>
        <p className="text-foreground/70 mt-3 text-lg">
          {t("CHAT.EMPTY_DESCRIPTION")}
        </p>
      </div>
      {/* Composer skeleton: same width/radius/padding as the real shell. */}
      <div className="mx-auto w-full max-w-176 px-4 pb-[max(--spacing(1),env(safe-area-inset-bottom))] md:pb-[max(--spacing(2.5),env(safe-area-inset-bottom))]">
        <div className="bg-background flex w-full flex-col gap-2 rounded-3xl border p-2.5">
          <p className="text-muted-foreground/80 px-1.75 py-1 text-sm">
            {t("CHAT.INPUT_PLACEHOLDER")}
          </p>
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
