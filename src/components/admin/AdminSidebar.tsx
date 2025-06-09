
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart2, 
  Settings, 
  BotMessageSquare, 
  Archive, // For Inventory
  ArrowLeftRight // For general purpose, or replace if a better 'store front' icon is found
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/products/new', label: 'Novo Produto (IA)', icon: BotMessageSquare, className: "text-accent-foreground bg-accent hover:bg-accent/90" },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/inventory', label: 'Estoque', icon: Archive },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart2 },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-card text-card-foreground p-4 flex-col fixed top-0 left-0 shadow-xl border-r border-border hidden md:flex">
      <div className="mb-6 mt-2 flex justify-center">
        <Link href="/admin" aria-label="Admin Dashboard Home">
          <Logo width={60} height={60} />
        </Link>
      </div>
      <nav className="flex-grow space-y-1.5">
        {adminNavLinks.map((link) => {
          const isActive = pathname === link.href || 
                           (link.href !== '/admin' && pathname.startsWith(link.href) && link.href !== '/admin/products/new') ||
                           (link.href === '/admin/products' && pathname.startsWith('/admin/products/edit')); 
                           
          const isNewProductActive = link.href === '/admin/products/new' && pathname === '/admin/products/new';


          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 p-2.5 rounded-md transition-colors text-sm font-medium",
                (isActive || isNewProductActive)
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted hover:text-primary",
                link.className // Apply special class for AI button
              )}
              aria-current={isActive || isNewProductActive ? "page" : undefined}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-4">
        <Button variant="outline" className="w-full" asChild>
            <Link href="/" className="flex items-center justify-center">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Voltar para a Loja
            </Link>
        </Button>
      </div>
    </aside>
  );
}
