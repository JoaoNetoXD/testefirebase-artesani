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
  fill?: boolean;
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
  fill = false,
  className,
  priority = false,
  placeholder = 'empty',
  fallbackSrc = 'https://placehold.co/400x300.png',
  sizes,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${imageSrc}`);
    setIsLoading(false);
    
    if (imageSrc !== fallbackSrc && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false); // Reset error state to try fallback
    } else {
      setHasError(true);
    }
    
    onError?.();
  };

  // Validation for required props
  if (!src || typeof src !== 'string') {
    console.warn('LazyImage: src prop is required and must be a string');
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground rounded-lg border", className)}>
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">Imagem inválida</p>
        </div>
      </div>
    );
  }

  if (!alt || typeof alt !== 'string') {
    console.warn('LazyImage: alt prop is required for accessibility');
  }

  // Show error state if image failed to load and no fallback is available
  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-muted text-muted-foreground rounded-lg border", className)}
        style={fill ? {} : { width: width || 400, height: height || 300 }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  const imageProps = {
    ref: imgRef,
    src: imageSrc,
    alt: alt || 'Imagem',
    className: cn(
      className,
      isLoading && 'opacity-0 transition-opacity duration-300',
      !isLoading && 'opacity-100 transition-opacity duration-300'
    ),
    priority,
    placeholder,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
  };

  // Handle fill prop for Next.js Image
  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        style={{ objectFit: 'cover' }}
      />
    );
  }

  // Ensure width and height are valid numbers
  const finalWidth = width && typeof width === 'number' && width > 0 ? width : 400;
  const finalHeight = height && typeof height === 'number' && height > 0 ? height : 300;

  return (
    <Image
      {...imageProps}
      width={finalWidth}
      height={finalHeight}
    />
  );
}

// Loading skeleton component
export function ImageSkeleton({ 
  className, 
  width = 400, 
  height = 300 
}: { 
  className?: string; 
  width?: number; 
  height?: number; 
}) {
  return (
    <div 
      className={cn("animate-pulse bg-muted rounded-lg", className)}
      style={{ width, height }}
    />
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
  width?: number;
  height?: number;
}

export function ProductImage({ 
  product, 
  className, 
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width = 400,
  height = 400
}: ProductImageProps) {
  const primaryImage = product.images?.[0];
  const fallbackImage = 'https://placehold.co/400x400.png';

  return (
    <LazyImage
      src={primaryImage || fallbackImage}
      alt={product.name}
      className={className}
      priority={priority}
      fallbackSrc={fallbackImage}
      sizes={sizes}
      width={width}
      height={height}
    />
  );
}

export default LazyImage;

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