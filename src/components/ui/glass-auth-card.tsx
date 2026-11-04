import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassAuthCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
}

// No card or glass: the auth layout already frames the form, so this is just a
// left-aligned heading above it.
export function GlassAuthCard(props: GlassAuthCardProps) {
  return (
    <div className={cn("animate-fade-in w-full max-w-sm", props.className)}>
      {(props.title || props.description) && (
        <div className="mb-8 space-y-2">
          {props.title && (
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              {props.title}
            </h1>
          )}
          {props.description && (
            <p className="text-muted-foreground text-base">
              {props.description}
            </p>
          )}
        </div>
      )}
      {props.children}
    </div>
  );
}
