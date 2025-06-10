
"use client";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [currentUser, loading, isAdmin, router]);

  if (loading || !currentUser || (currentUser && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-8 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
