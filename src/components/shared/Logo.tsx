
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
  // TEMPORARY: Using a placeholder image for troubleshooting
  const placeholderSrc = `https://placehold.co/${width}x${height}.png`;

  return (
    <Link href="/" className={cn('inline-block align-middle', className)}>
      <Image
        src={placeholderSrc} // Using the placeholder
        alt="Farmácia Artesani Logo - Placeholder"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
        data-ai-hint="logo placeholder"
      />
    </Link>
  );
}
