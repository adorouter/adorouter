"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMediaFocal, useMediaSrc } from "@/hooks/ai/use-media-src";

export function EntityAvatar(props: {
  mediaId: string | null | undefined;
  name: string;
  className?: string;
}) {
  const src = useMediaSrc(props.mediaId);
  const objectPosition = useMediaFocal(props.mediaId);
  return (
    <Avatar className={props.className ?? "size-10"}>
      {/* A plain img, not AvatarImage: base-ui 1.7.0 re-runs its loading-status
          effect on every render for a blob: URL and blows the update depth, which
          crashes the whole list as soon as one avatar is present. */}
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- local blob URL, next/image cannot optimize it
        <img
          src={src}
          alt={props.name}
          className="absolute inset-0 aspect-square size-full rounded-full object-cover"
          style={{ objectPosition }}
        />
      )}
      <AvatarFallback>{props.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
    </Avatar>
  );
}
