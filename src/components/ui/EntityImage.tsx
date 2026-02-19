/**
 * @file EntityImage.tsx
 * @description CRITICAL CORE COMPONENT. Handles display of all entity images with fallback logic.
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { useState } from "react";

import { ImageOff } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { cn } from "@/lib/utils";
import { getCardAltText, getCardImageUrl } from "@/services/assets/asset-helpers";
import { UnifiedEntity } from "@/types/api";

interface EntityImageProps {
  entity: UnifiedEntity;
  className?: string;
  alt?: string;
}

export function EntityImage({ entity, className, alt }: EntityImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If image_required is explicitly false, or if we've already detected an error
  // show the placeholder.
  const showPlaceholder = error || entity.image_required === false;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-card border border-border-default rounded-lg",
          className
        )}
      >
        <ImageOff className="w-1/3 h-1/3 text-text-primary/20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-card rounded-lg",
        className
      )}
    >
      <GameImage
        src={getCardImageUrl(entity)}
        alt={alt || getCardAltText(entity)}
        fill
        className={cn(
          "object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          // GameImage handles retry logic internally first.
          // If it bubbles up to here, it means retry failed too.
          setError(true);
        }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Loading Skeleton */}
      {!loaded && <div className="absolute inset-0 bg-surface-card animate-pulse" />}
    </div>
  );
}
