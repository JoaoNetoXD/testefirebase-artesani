
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart2, Settings, BotMessageSquare } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/products/new', label: 'Novo Produto (AI)', icon: BotMessageSquare },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart2 },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-primary text-primary-foreground p-4 flex flex-col fixed top-0 left-0 shadow-xl">
      <div className="mb-8 flex justify-center">
        <Logo width={60} height={60} />
      </div>
      <nav className="flex-grow space-y-2">
        {adminNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-md transition-colors",
                isActive 
                  ? "bg-primary-foreground text-primary font-semibold shadow-inner" 
                  : "hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Link href="/" className="block text-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
          Voltar para a Loja
        </Link>
      </div>
    </aside>
  );
}
