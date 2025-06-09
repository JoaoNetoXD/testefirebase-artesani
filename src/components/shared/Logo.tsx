
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`inline-block ${className}`}>
      <div className="bg-primary text-primary-foreground p-3 rounded-md shadow-md hover:shadow-lg transition-shadow">
        <h1 className="text-2xl font-headline font-bold tracking-tight">
          Artesani Pharmacy
        </h1>
      </div>
    </Link>
  );
}
