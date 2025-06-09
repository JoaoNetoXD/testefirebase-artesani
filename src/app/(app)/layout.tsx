
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-0"> {/* Aumentar margem inferior para mobile */}
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
