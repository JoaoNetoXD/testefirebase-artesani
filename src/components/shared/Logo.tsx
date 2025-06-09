
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  textClassName?: string;
  taglineClassName?: string;
}

export function Logo({ className, textClassName, taglineClassName }: LogoProps) {
  return (
    <Link href="/" className={cn(`inline-block`, className)}>
      {/* The image shows an actual "Artesani" logo image, but we'll use text for now. */}
      {/* The background is handled by the parent Header typically */}
      <div>
        <h1 className={cn("text-2xl font-headline font-bold tracking-tight text-primary-foreground", textClassName)}>
          Farmácia Artesani
        </h1>
        <p className={cn("text-xs text-muted-foreground", taglineClassName)}>
          Sua saúde em boas mãos
        </p>
      </div>
    </Link>
  );
}
