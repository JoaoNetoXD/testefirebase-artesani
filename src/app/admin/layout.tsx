
"use client";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// !!! IMPORTANT: Change this to the actual administrator's email address !!!
const ADMIN_EMAIL = 'admin@artesani.com'; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login?redirect=/admin'); // Redirect to login if not authenticated
      } else if (currentUser.email !== ADMIN_EMAIL) {
        router.push('/'); // Redirect to homepage if not admin
      }
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser || (currentUser && currentUser.email !== ADMIN_EMAIL)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando acesso...</p>
      </div>
    );
  }

  // If currentUser exists and is the admin, render the admin layout
  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-8 ml-0 md:ml-64"> {/* Adjusted ml for consistency, sidebar is fixed */}
        {children}
      </main>
    </div>
  );
}
