"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, roomPhoto } from "@/lib/utils";

export function RoomImage({
  seed,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 400px",
  priority,
  width = 800,
  height = 600,
}: {
  seed: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <Image
        src={roomPhoto(seed, width, height)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
