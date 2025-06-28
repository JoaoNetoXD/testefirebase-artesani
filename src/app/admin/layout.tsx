
"use client";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading, isAdmin, refreshProfile } = useAuth();
  const router = useRouter();
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Aguardar hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Aguardar um pouco para evitar navegações prematuras
    const navigationTimeout = setTimeout(() => {
      if (!loading) {
        if (!currentUser) {
          router.push('/login?redirect=/admin');
        } else if (!isAdmin) {
          router.push('/');
        }
      }
    }, 100);

    return () => clearTimeout(navigationTimeout);
  }, [currentUser, loading, isAdmin, router]);

  // Timeout de segurança adicional para o admin layout
  useEffect(() => {
    if (!loading) {
      setShowRefreshButton(false);
      return;
    }

    // After 5 seconds, show refresh button
    const refreshButtonTimeout = setTimeout(() => {
      setShowRefreshButton(true);
    }, 5000);

    // After 20 seconds, force redirect
    const adminTimeout = setTimeout(() => {
      router.push('/login?redirect=/admin&timeout=true');
    }, 20000);

    return () => {
      clearTimeout(refreshButtonTimeout);
      clearTimeout(adminTimeout);
    };
  }, [loading, router]);

  // Aguardar hidratação completa
  if (!mounted) {
    return null;
  }

  // Adicionar um timeout de segurança para evitar loading infinito
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-foreground">Verificando acesso...</p>
          </div>
          {showRefreshButton && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Demorando mais que o esperado?
              </p>
              <button
                onClick={refreshProfile}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-8 ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}
