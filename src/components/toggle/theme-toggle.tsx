"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createAnimation,
  getRandomAnimation,
} from "@/components/ui/theme-animations";
import { ThemeCustomizerSheet } from "@/components/elements/theme/customizer-sheet";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";

const MODES = [
  { value: "light", icon: "sun", label: "THEME.LIGHT" },
  { value: "dark", icon: "moon", label: "THEME.DARK" },
  { value: "system", icon: "monitor", label: "THEME.SYSTEM" },
] as const;

export function ThemeToggle() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const styleId = "theme-transition-styles";

  const updateStyles = (css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  };

  const handleThemeChange = (theme: string) => {
    const anim = getRandomAnimation();
    const animation = createAnimation(anim.variant, anim.start);
    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme);
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Toggle theme" />
          }
        >
          <Icon
            name="sun"
            className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
          <Icon
            name="moon"
            className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
        </DropdownMenuTrigger>
        {/* AdoRouter: our own layout (2026-11-07), matching the account menu:
            the three modes as tiles with the current one marked, then the
            customizer on its own row. Upstream had a plain list. */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 rounded-2xl p-3"
        >
          <p className="text-muted-foreground px-1 pb-2 font-mono text-[11px] tracking-widest uppercase">
            {t("THEME.APPEARANCE")}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {MODES.map((mode) => (
              <DropdownMenuItem
                key={mode.value}
                aria-current={theme === mode.value ? "true" : undefined}
                onClick={() => handleThemeChange(mode.value)}
                className="border-border/60 hover:border-border aria-[current=true]:border-primary aria-[current=true]:bg-primary/10 aria-[current=true]:text-primary flex-col gap-1.5 rounded-xl border px-1 py-2.5 text-xs"
              >
                <Icon name={mode.icon} className="h-4 w-4" />
                {t(mode.label)}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuItem
            onClick={() => setSheetOpen(true)}
            className="border-border/60 hover:border-border mt-1.5 rounded-xl border px-2.5 py-2 text-xs"
          >
            <Icon name="paintbrush" className="text-muted-foreground h-4 w-4" />
            <span className="flex-1">{t("THEME.CUSTOMIZE")}</span>
            <Icon
              name="chevron-right"
              className="text-muted-foreground h-3.5 w-3.5"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeCustomizerSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
