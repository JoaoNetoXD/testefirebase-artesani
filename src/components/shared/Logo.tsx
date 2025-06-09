
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

export function Logo({ className, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, priority = false }: LogoProps) {
  return (
    <Link href="/" className={cn('inline-block align-middle', className)}>
      <Image
        src="/images/artesani-logo.png" // Trying to load from public/images/artesani-logo.png
        alt="Farmácia Artesani Logo"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
        data-ai-hint="pharmacy logo" // Added a hint, though not directly related to the fix
      />
    </Link>
  );
}
