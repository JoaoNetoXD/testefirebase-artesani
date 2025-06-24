import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  withLink?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function Logo({ withLink = true, width = 60, height = 60, priority = false }: LogoProps) {
  const logoElement = (
    <Image
      src="/images/artesani-logo.png"
      alt="Artesani Logo"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{
        width: 'auto',
        height: 'auto',
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
        objectFit: 'contain'
      }}
    />
  );

  if (withLink) {
    return (
      <Link href="/" className="flex-shrink-0">
        {logoElement}
      </Link>
    );
  }

  return <div className="flex-shrink-0">{logoElement}</div>;
}
