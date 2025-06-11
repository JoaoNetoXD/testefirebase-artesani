
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
  Archive, 
  ArrowLeftRight,
  PlusCircle,
  Folder
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/categories', label: 'Categorias', icon: Folder },
  { href: '/admin/inventory', label: 'Estoque', icon: Archive },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart2 },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-primary text-primary-foreground p-4 flex-col fixed top-0 left-0 shadow-2xl border-r border-border/10 hidden md:flex z-50">
      <div className="mb-8 mt-4 flex justify-center">
        <Link href="/" aria-label="Voltar para a loja">
          <Logo width={50} height={50} />
        </Link>
      </div>
      
      <div className="flex-grow flex flex-col justify-between">
        <nav className="space-y-2">
          {adminNavLinks.map((link) => {
            const isActive = pathname === link.href ||
                             (link.href !== '/admin' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-black/20 text-white shadow-inner" 
                    : "hover:bg-black/10 text-primary-foreground/70 hover:text-white"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4">
            <Button variant="secondary" className="w-full" asChild>
                <Link href="/admin/products/new" className="flex items-center justify-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Produto
                </Link>
            </Button>
            <Button variant="ghost" className="w-full text-primary-foreground/70 hover:text-white" asChild>
                <Link href="/" className="flex items-center justify-center">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Ir para a Loja
                </Link>
            </Button>
        </div>
      </div>
    </aside>
  );
}
