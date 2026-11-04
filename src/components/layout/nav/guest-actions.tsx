"use client";

import { LoginLink } from "@/components/elements/brand/login-link";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";

// Plain English like the other AdoRouter pages: only the en locale is served,
// and new keys would also have to exist in de.json for the generated types.
export function GuestActions() {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <LoginLink className="text-foreground/80 hover:text-foreground px-2 py-1 text-[15px] font-medium transition-colors">
        Log in
      </LoginLink>
      <Link
        href="/register"
        prefetch={false}
        className="bg-primary text-primary-foreground hover:bg-primary/85 hidden items-center gap-1 rounded-full py-2 pr-3 pl-4 text-[15px] font-medium transition-colors sm:inline-flex"
      >
        Sign up
        <Icon name="chevron-right" className="size-4" />
      </Link>
    </div>
  );
}
