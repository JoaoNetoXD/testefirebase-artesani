
"use client";
import Link from 'next/link';
import { ListOrdered, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const accountNavLinks = [
  { href: '/account', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Meus Pedidos', icon: ListOrdered },
  { href: '/account/profile', label: 'Meu Perfil', icon: User },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);


  if (loading || !currentUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Carregando...</p></div>;
  }
  
  const handleLogout = async () => {
    await logout();
    // O AuthContext já redireciona para /login após o logout
  };

  return (
    <div className="grid md:grid-cols-4 gap-8 py-8">
      <aside className="md:col-span-1">
        <h2 className="text-2xl font-headline mb-6">Minha Conta</h2>
        <nav className="space-y-2">
          {accountNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center space-x-3 p-3 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          ))}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center space-x-3 p-3 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors w-full justify-start"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </nav>
      </aside>
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
