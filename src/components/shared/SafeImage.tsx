"use client";

import Image from "next/image";
import { useState } from "react";
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
  width = 400,
  height = 300,
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

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    setHasError(true);
    
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    }
    
    onError?.();
  };

  const handleLoad = () => {
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
        style={fill ? {} : { width, height }}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm text-center">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  // Propriedades base do Image
  const imageProps = {
    src: currentSrc,
    alt,
    className,
    sizes,
    priority,
    quality,
    placeholder,
    onLoad: handleLoad,
    onError: handleError,
  };

  // Se usar fill, deve ter posição relative no contêiner
  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  // Caso contrário, usar width e height
  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  );
}

export default SafeImage; 