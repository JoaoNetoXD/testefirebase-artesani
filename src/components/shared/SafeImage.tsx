"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes,
  priority = false,
  quality = 75,
  placeholder = "empty",
  fallbackSrc = "https://placehold.co/400x300.png",
  onLoad,
  onError,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SafeImage Props:', {
        src,
        alt,
        width,
        height,
        fill,
        className
      });
    }
  }, [src, alt, width, height, fill, className]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Validação robusta das propriedades
  if (!src || typeof src !== 'string' || src.trim() === '') {
    console.warn('SafeImage: src prop is required and must be a non-empty string', { src, alt });
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground border border-border rounded-lg",
          className
        )}
        style={fill ? {} : { width: width || 400, height: height || 300 }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm text-center">Imagem inválida</p>
        </div>
      </div>
    );
  }

  if (!alt || typeof alt !== 'string') {
    console.warn('SafeImage: alt prop is required and must be a string for accessibility', { src, alt });
  }

  // Validação crítica para Next.js 15
  if (!fill && (!width || !height || width <= 0 || height <= 0)) {
    console.error('SafeImage: width and height are required when not using fill prop', {
      src,
      width,
      height,
      fill,
      alt
    });
    
    // Forçar valores padrão válidos
    width = width && width > 0 ? width : 400;
    height = height && height > 0 ? height : 300;
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`SafeImage: Using default dimensions ${width}x${height} for image: ${src}`);
    }
  }

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    setIsLoading(false);
    
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      console.log(`Trying fallback image: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
    }
    
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Se houve erro e não há fallback, mostrar placeholder
  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground border border-border rounded-lg",
          className
        )}
        style={fill ? {} : { width: width || 400, height: height || 300 }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm text-center">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  // Propriedades comuns do Image
  const baseProps = {
    src: currentSrc,
    alt: alt || "Imagem",
    className: cn(
      className,
      isLoading && "opacity-0 transition-opacity duration-300",
      !isLoading && "opacity-100 transition-opacity duration-300"
    ),
    priority,
    quality,
    placeholder,
    onLoad: handleLoad,
    onError: handleError,
    sizes,
  };

  // Para Next.js 15: Se usar fill, garantir que é explícito
  if (fill) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SafeImage: Using fill layout for', currentSrc);
    }
    
    return (
      <Image
        {...baseProps}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        style={{ 
          objectFit: 'cover',
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          color: 'transparent'
        }}
      />
    );
  }

  // Garantir que width e height são números válidos e positivos
  const finalWidth = width && typeof width === 'number' && width > 0 ? width : 400;
  const finalHeight = height && typeof height === 'number' && height > 0 ? height : 300;

  if (process.env.NODE_ENV === 'development') {
    console.log('SafeImage: Using explicit dimensions', { 
      finalWidth, 
      finalHeight, 
      originalWidth: width, 
      originalHeight: height,
      src: currentSrc 
    });
  }

  // Retornar componente Image com dimensões explícitas
  try {
    return (
      <Image
        {...baseProps}
        width={finalWidth}
        height={finalHeight}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'cover'
        }}
      />
    );
  } catch (error) {
    console.error('SafeImage: Error rendering Image component', {
      error,
      props: { ...baseProps, width: finalWidth, height: finalHeight }
    });
    
    // Fallback para erro de renderização
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground border border-border rounded-lg",
          className
        )}
        style={{ width: finalWidth, height: finalHeight }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm text-center">Erro ao carregar imagem</p>
        </div>
      </div>
    );
  }
}

export default SafeImage; 