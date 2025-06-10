import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const DEFAULT_WIDTH = 70;
const DEFAULT_HEIGHT = 70;

export function Logo({
  className,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  priority = false,
}: LogoProps) {
  return (
    <Link href="/" className={cn('inline-block align-middle', className)}>
      <Image
        src="/images/artesani-logo.png" // Certifique-se de que a imagem tem alta resolução.
        alt="Farmácia Artesani Logo"
        width={width}
        height={height}
        priority={priority}
        unoptimized // Desabilita a otimização automática do Next.js
        className="object-contain"
        style={{
          imageRendering: 'auto', // Remove o 'crisp-edges' para evitar distorções
          filter: 'none',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        data-ai-hint="pharmacy logo"
        loading={priority ? 'eager' : 'lazy'} // Carregamento preguiçoso ou imediato
      />
    </Link>
  );
}
