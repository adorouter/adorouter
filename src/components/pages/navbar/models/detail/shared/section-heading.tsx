import { getVendorTheme } from "@/lib/config/vendor-registry";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Theme = ReturnType<typeof getVendorTheme>;

// AdoRouter: plain sentence-case headings instead of unorouter's vendor-tinted
// mono labels. `theme` is still accepted so the shared sections don't change.
const HEADING = "text-foreground text-xl font-semibold tracking-tight";

// `action` renders a right-aligned slot (period tabs); `icon` a leading glyph.
export function SectionHeading(props: {
  theme: Theme;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  const heading = <h2 className={HEADING}>{props.children}</h2>;

  if (props.action) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2",
          props.className ?? "mb-4",
        )}
      >
        {heading}
        {props.action}
      </div>
    );
  }

  if (props.icon) {
    return (
      <div className={cn("flex items-center gap-2", props.className ?? "mb-4")}>
        {props.icon}
        {heading}
      </div>
    );
  }

  return (
    <h2 className={cn(HEADING, props.className ?? "mb-4")}>{props.children}</h2>
  );
}
