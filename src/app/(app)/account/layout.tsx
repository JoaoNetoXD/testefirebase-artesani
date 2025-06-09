
import Link from 'next/link';
import { ListOrdered, User, Heart, LogOut, LayoutDashboard } from 'lucide-react';

const accountNavLinks = [
  { href: '/account', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Meus Pedidos', icon: ListOrdered },
  { href: '/account/profile', label: 'Meu Perfil', icon: User },
  { href: '/account/favorites', label: 'Favoritos', icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link
            href="/api/auth/logout" // Placeholder for logout
            className="flex items-center space-x-3 p-3 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Link>
        </nav>
      </aside>
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
