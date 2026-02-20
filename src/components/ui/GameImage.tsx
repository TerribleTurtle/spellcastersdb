"use client";

import { SyntheticEvent, useState } from "react";

import Image, { ImageProps } from "next/image";

import { cn } from "@/lib/utils";

interface GameImageProps extends Omit<ImageProps, "onError"> {
  // Optional: Add specific props if needed, e.g. disableFallback
  fallbackSrc?: string;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function GameImage({
  src,
  alt,
  className,
  onError,
  ...props
}: GameImageProps) {
  const [imgSrc, setImgSrc] = useState<
    string | import("next/dist/shared/lib/get-img-props").StaticImport
  >(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Track previous src to trigger reset during render
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
    setHasError(false);
    setRetryCount(0);
  }

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    // If we've already failed or it's not a string src we can manipulate, just fail
    if (typeof imgSrc !== "string") {
      setHasError(true);
      if (onError) onError(e);
      return;
    }

    // Attempt Fallback Logic: Toggle Extension
    // 1. If ending in .png -> try .webp
    // 2. If ending in .webp -> try .png
    // Only try once (retryCount === 0)
    if (retryCount === 0) {
      if (imgSrc.endsWith(".png")) {
        const newSrc = imgSrc.replace(/\.png$/, ".webp");
        // Silent retry
        setImgSrc(newSrc);
        setRetryCount(1);
        return;
      } else if (imgSrc.endsWith(".webp")) {
        const newSrc = imgSrc.replace(/\.webp$/, ".png");
        // Silent retry
        setImgSrc(newSrc);
        setRetryCount(1);
        return;
      }
    }

    // If we get here, we failed the fallback or it wasn't a swappable extension
    setHasError(true);
    if (onError) onError(e);
  };

  // Remote images (GitHub Pages) are already WebP-optimized.
  // Bypass Vercel's optimizer to avoid intermittent 400 errors.
  const isRemote = typeof imgSrc === "string" && imgSrc.startsWith("http");

  return (
    <Image
      key={String(src)}
      {...props}
      src={imgSrc}
      alt={alt || ""}
      className={cn(className, hasError ? "opacity-50 grayscale" : "")}
      onError={handleError}
      unoptimized={isRemote}
    />
  );
}
