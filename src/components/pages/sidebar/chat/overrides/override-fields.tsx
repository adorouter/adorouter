"use client";

import { MyFormCombobox } from "@/components/elements/form/my-form-combobox";
import { MyFormEntitySelect } from "@/components/elements/form/my-form-entity-select";
import { MyFormKeyedSelect } from "@/components/elements/form/my-form-keyed-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoPopover } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImageModelField,
  UtilityModelField,
} from "@/components/pages/sidebar/chat/overrides/model-fields";
import { IMAGE_STYLE_TEMPLATES } from "@/lib/ai/chat/image-style-templates";
import {
  DEFAULT_CHAT_MEMORY,
  MAX_CHAT_MEMORY,
  msg,
  NONE_VALUE,
} from "@/lib/config/constants";
import { parseExtraBody } from "@/lib/validation/chat";
import type { ConversationOverridesForm } from "@/lib/validation/rp-forms";
import { focusMemoryFieldAtom } from "@/store/chat-store";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import { useFormContext, type Control } from "react-hook-form";
import {
  REASONING_EFFORT_KEY,
  WEB_SEARCH_CONTEXT_KEY,
  WEB_SEARCH_ENGINE_KEY,
} from "./form-handler";

export function OverridesGenerationFields(props: {
  control: Control<ConversationOverridesForm>;
}) {
  const t = useTranslations();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MyFormKeyedSelect
          control={props.control}
          name="reasoningEffort"
          label={t("CHAT.OVERRIDES.REASONING_EFFORT")}
          fallback={NONE_VALUE}
          optionKeys={REASONING_EFFORT_KEY}
          leadingOptions={[
            {
              value: NONE_VALUE,
              labelKey: msg("CHAT.OVERRIDES.MODEL_DEFAULT"),
            },
            { value: "none", labelKey: msg("CHAT.OVERRIDES.OFF") },
          ]}
        />
        <FormField
          control={props.control}
          name="chatMemory"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FormLabel>{t("CHAT.OVERRIDES.CHAT_MEMORY")}</FormLabel>
                  <InfoPopover text={t("CHAT.OVERRIDES.CHAT_MEMORY_HINT")} />
                </div>
                <Input
                  type="number"
                  min={1}
                  max={MAX_CHAT_MEMORY}
                  step={1}
                  inputMode="numeric"
                  className="h-7 w-20 text-xs tabular-nums"
                  placeholder={t("CHAT.OVERRIDES.INHERIT")}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") return field.onChange(null);
                    const n = Math.round(Number(raw));
                    if (!Number.isFinite(n)) return;
                    field.onChange(Math.min(MAX_CHAT_MEMORY, Math.max(1, n)));
                  }}
                />
              </div>
              <FormControl>
                {/* Without step the browser derives one from the range, and at
                    1000 that lands between 8 and 12 where people actually work. */}
                <Slider
                  min={1}
                  max={MAX_CHAT_MEMORY}
                  step={1}
                  value={[field.value ?? DEFAULT_CHAT_MEMORY]}
                  onValueChange={(v) =>
                    field.onChange(Array.isArray(v) ? v[0] : v)
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border p-3">
        <FormField
          control={props.control}
          name="streamingEnabled"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2">
              <FormLabel className="text-xs">
                {t("CHAT.OVERRIDES.STREAMING_ENABLED")}
              </FormLabel>
              <FormControl>
                <Switch
                  size="sm"
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="autoScrollStream"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2">
              <FormLabel className="text-xs">
                {t("CHAT.OVERRIDES.AUTO_SCROLL_STREAM")}
              </FormLabel>
              <FormControl>
                <Switch
                  size="sm"
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="showReasoning"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2">
              <FormLabel className="text-xs">
                {t("CHAT.OVERRIDES.SHOW_REASONING")}
              </FormLabel>
              <FormControl>
                <Switch
                  size="sm"
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <span className="text-muted-foreground text-xs">
        {t("CHAT.OVERRIDES.STREAMING_ENABLED_HINT")}
      </span>

      <span className="text-muted-foreground text-xs">
        {t("CHAT.OVERRIDES.AUTO_SCROLL_STREAM_HINT")}
      </span>

      <div className="flex flex-col gap-3 border-t pt-3">
        <UtilityModelField
          control={props.control}
          name="titleModel"
          labelKey="CHAT.OVERRIDES.TITLE_MODEL"
          hintKey="CHAT.OVERRIDES.TITLE_MODEL_HINT"
        />
        <TitlePromptField control={props.control} />
      </div>
    </>
  );
}

function TitlePromptField(props: {
  control: Control<ConversationOverridesForm>;
}) {
  const t = useTranslations();
  return (
    <FormField
      control={props.control}
      name="titlePrompt"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-muted-foreground text-xs">
            {t("CHAT.OVERRIDES.TITLE_PROMPT")}
          </FormLabel>
          <FormControl>
            <Textarea
              className="min-h-16 text-xs"
              placeholder={t("CHAT.OVERRIDES.TITLE_PROMPT_PLACEHOLDER")}
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function OverridesPromptFields(props: {
  control: Control<ConversationOverridesForm>;
}) {
  const t = useTranslations();

  return (
    <>
      <FormField
        control={props.control}
        name="extraBody"
        render={({ field }) => {
          const invalid = parseExtraBody(field.value).state === "invalid";
          return (
            <FormItem>
              <FormLabel>{t("CHAT.OVERRIDES.EXTRA_BODY")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("CHAT.OVERRIDES.EXTRA_BODY_PLACEHOLDER")}
                  rows={4}
                  className={
                    invalid
                      ? "border-destructive focus-visible:ring-destructive font-mono text-xs"
                      : "font-mono text-xs"
                  }
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                {invalid
                  ? t("CHAT.OVERRIDES.EXTRA_BODY_INVALID")
                  : t("CHAT.OVERRIDES.EXTRA_BODY_HINT")}
              </p>
            </FormItem>
          );
        }}
      />

      <FormField
        control={props.control}
        name="systemPromptOverride"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("CHAT.OVERRIDES.SYSTEM_PROMPT")}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("CHAT.OVERRIDES.SYSTEM_PROMPT_PLACEHOLDER")}
                rows={4}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
