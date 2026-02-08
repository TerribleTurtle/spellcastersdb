/**
 * @file EntityImage.tsx
 * @description CRITICAL CORE COMPONENT. Handles display of all entity images with fallback logic.
 * DO NOT DELETE OR MODIFY WITHOUT VERIFICATION.
 */
import { GameImage } from "@/components/ui/GameImage";
import { useState } from "react";
import { UnifiedEntity } from "@/types/api";
import { cn, getCardImageUrl } from "@/lib/utils";
import { ImageOff } from "lucide-react";

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
      <div className={cn("flex items-center justify-center bg-white/5 border border-white/10 rounded-lg", className)}>
        <ImageOff className="w-1/3 h-1/3 text-white/20" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-card rounded-lg", className)}>
      <GameImage
        src={getCardImageUrl(entity)}
        alt={alt || entity.name}
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
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
    </div>
  );
}
