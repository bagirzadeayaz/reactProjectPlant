import { type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';

export interface ImageSource {
  src: string;
  width: number;
  /** MIME type of a modern format. Untyped sources go on the `<img>` itself. */
  type?: 'image/avif' | 'image/webp';
}

/** Modern formats first: the browser takes the first `<source>` it can decode. */
const FORMAT_ORDER: NonNullable<ImageSource['type']>[] = ['image/avif', 'image/webp'];

const srcSetOf = (sources: readonly ImageSource[]): string =>
  sources.map((source) => `${source.src} ${String(source.width)}w`).join(', ');

export interface ResponsiveImageProps extends Omit<
  ComponentPropsWithRef<'img'>,
  'src' | 'srcSet' | 'width' | 'height' | 'loading'
> {
  /** Fallback for browsers that ignore `srcSet`. */
  src: string;
  /** Widths the same picture is available at; the browser picks by layout size. */
  sources?: readonly ImageSource[];
  /** Intrinsic size so the box is reserved before the bytes arrive — no layout shift. */
  width: number;
  height: number;
  /** Hero imagery is `eager`; everything below the fold waits. */
  priority?: boolean;
  alt: string;
}

/**
 * An `<img>` that reserves its space and lets the browser choose a size — and
 * a format: typed sources become `<source>` elements in a `<picture>`, AVIF
 * before WebP, with the plain `src` as the fallback every browser can read.
 *
 * `width` and `height` are the intrinsic ratio, not the rendered size — CSS
 * still controls layout. `decoding="async"` keeps a large decode off the
 * main thread; `fetchPriority="high"` on the hero gets it requested first.
 */
export const ResponsiveImage = ({
  src,
  sources,
  width,
  height,
  priority = false,
  alt,
  className,
  sizes,
  ...props
}: ResponsiveImageProps) => {
  const untyped = (sources ?? []).filter((source) => source.type === undefined);
  const typed = FORMAT_ORDER.map((type) => ({
    type,
    sources: (sources ?? []).filter((source) => source.type === type),
  })).filter((group) => group.sources.length > 0);

  const img = (
    <img
      src={src}
      {...(untyped.length > 0 ? { srcSet: srcSetOf(untyped) } : {})}
      {...(sizes === undefined ? {} : { sizes })}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      className={cn('h-auto max-w-full', className)}
      {...props}
    />
  );

  if (typed.length === 0) return img;
  return (
    <picture>
      {typed.map((group) => (
        <source
          key={group.type}
          type={group.type}
          srcSet={srcSetOf(group.sources)}
          {...(sizes === undefined ? {} : { sizes })}
        />
      ))}
      {img}
    </picture>
  );
};
