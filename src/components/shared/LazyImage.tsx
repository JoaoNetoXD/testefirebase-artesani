'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  fallbackSrc?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  fallbackSrc,
  sizes,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLDivElement>(null);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, start loading
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  if (hasError) {
    return (
      <div
        ref={imageRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground border border-border rounded-lg',
          className
        )}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm text-center">
            Não foi possível carregar a imagem
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imageRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}

      {/* Main image */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        placeholder={placeholder}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          'w-full h-full object-cover'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

// Optimized product image component
interface ProductImageProps {
  product: {
    images?: string[];
    name: string;
  };
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ProductImage({ 
  product, 
  className, 
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: ProductImageProps) {
  const primaryImage = product.images?.[0];
  const fallbackImage = '/images/product-placeholder.jpg';

  return (
    <LazyImage
      src={primaryImage || fallbackImage}
      alt={product.name}
      className={className}
      priority={priority}
      fallbackSrc={fallbackImage}
      sizes={sizes}
      width={400}
      height={400}
    />
  );
}

// Gallery component with lazy loading
interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn('aspect-square bg-muted rounded-lg', className)}>
        <div className="flex items-center justify-center h-full">
          <ImageOff className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <div className="aspect-square">
        <LazyImage
          src={images[currentIndex]}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          className="w-full h-full rounded-lg"
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          width={600}
          height={600}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                currentIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground'
              )}
            >
              <LazyImage
                src={image}
                alt={`${alt} - Miniatura ${index + 1}`}
                className="w-full h-full"
                width={64}
                height={64}
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 