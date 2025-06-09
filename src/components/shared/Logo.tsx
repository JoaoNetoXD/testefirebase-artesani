
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Default size for the logo image, can be overridden by props
const DEFAULT_WIDTH = 70;
const DEFAULT_HEIGHT = 70;

export function Logo({ className, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, priority = false }: LogoProps) {
  return (
    <Link href="/" className={cn('inline-block align-middle', className)}>
      <Image
        src="/images/artesani-logo.png" // IMPORTANT: User needs to place their logo image here
        alt="Farmácia Artesani Logo"
        width={width}
        height={height}
        priority={priority}
        className="object-contain" // Ensures the logo scales nicely within the dimensions
      />
    </Link>
  );
}
