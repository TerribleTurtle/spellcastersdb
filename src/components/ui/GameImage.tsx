"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GameImageProps extends Omit<ImageProps, 'onError'> {
  // Optional: Add specific props if needed, e.g. disableFallback
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function GameImage({ src, alt, className, onError, ...props }: GameImageProps) {
  const [imgSrc, setImgSrc] = useState<string | import("next/dist/shared/lib/get-img-props").StaticImport>(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset state if src prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgSrc(src);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If we've already failed or it's not a string src we can manipulate, just fail
    if (typeof imgSrc !== 'string') {
        setHasError(true);
        if (onError) onError(e);
        return;
    }

    // Attempt Fallback Logic: Toggle Extension
    // 1. If ending in .png -> try .webp
    // 2. If ending in .webp -> try .png
    // Only try once (retryCount === 0)
    if (retryCount === 0) {
        if (imgSrc.endsWith('.png')) {
            const newSrc = imgSrc.replace(/\.png$/, '.webp');
            console.warn(`[GameImage] Failed to load ${imgSrc}, retrying with ${newSrc}`);
            setImgSrc(newSrc);
            setRetryCount(1);
            return;
        } else if (imgSrc.endsWith('.webp')) {
            const newSrc = imgSrc.replace(/\.webp$/, '.png');
            console.warn(`[GameImage] Failed to load ${imgSrc}, retrying with ${newSrc}`);
            setImgSrc(newSrc);
            setRetryCount(1);
            return;
        }
    }

    // If we get here, we failed the fallback or it wasn't a swappable extension
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={cn(className, hasError ? "opacity-50 grayscale" : "")}
      onError={handleError}
    />
  );
}
