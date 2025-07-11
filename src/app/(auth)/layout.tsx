
import Logo from '@/components/shared/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo width={120} height={120} priority />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
