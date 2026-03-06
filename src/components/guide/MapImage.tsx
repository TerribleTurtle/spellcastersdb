import Image from "next/image";

interface MapImageProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
}

/**
 * Displays an arena map overview image (served from the community API).
 *
 * The `src` must be a fully-resolved absolute URL — the caller is responsible
 * for prepending CONFIG.API.BASE_URL to the relative `image_urls.map` path.
 *
 * Uses `fill` layout inside an explicit aspect-ratio container so the image
 * never causes layout shift, regardless of the underlying image dimensions.
 */
export function MapImage({
  src,
  alt,
  className,
}: MapImageProps): React.JSX.Element {
  return (
    <figure
      className={`bg-surface-card border border-border-default rounded-lg overflow-hidden ${className ?? ""}`}
    >
      {/* 4:3 aspect ratio container — wide enough to show the map + legend */}
      <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
        />
      </div>
      <figcaption className="px-4 py-2 text-xs font-semibold text-text-muted border-t border-border-subtle text-center tracking-wide uppercase">
        Arena Map
      </figcaption>
    </figure>
  );
}
