'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

export function Breadcrumbs({ 
  items, 
  className, 
  showHome = true, 
  maxItems = 4 
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname);
  
  // Add home if requested and not already present
  const finalItems = showHome && breadcrumbItems[0]?.href !== '/' 
    ? [{ label: 'Home', href: '/' }, ...breadcrumbItems]
    : breadcrumbItems;

  // Truncate if too many items
  const displayItems = finalItems.length > maxItems
    ? [
        finalItems[0],
        { label: '...', href: '', isActive: false },
        ...finalItems.slice(-maxItems + 2)
      ]
    : finalItems;

  if (displayItems.length <= 1) {
    return null; // Don't show breadcrumbs for home page or single item
  }

  return (
    <nav 
      aria-label="Navegação hierárquica" 
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1" role="list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';
          
          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight 
                  className="h-3 w-3 text-muted-foreground mx-1" 
                  aria-hidden="true"
                />
              )}
              
              {/* Breadcrumb item */}
              {isEllipsis ? (
                <span 
                  className="text-muted-foreground"
                  aria-hidden="true"
                >
                  {item.label}
                </span>
              ) : isLast || item.isActive ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1 py-0.5"
                  aria-label={`Ir para ${item.label}`}
                >
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4" aria-label="Página inicial" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // Route mappings for better labels
  const routeLabels: Record<string, string> = {
    'products': 'Produtos',
    'category': 'Categoria',
    'about': 'Sobre Nós',
    'sobre-nos': 'Sobre Nós',
    'contact': 'Contato',
    'account': 'Minha Conta',
    'cart': 'Carrinho',
    'checkout': 'Finalizar Compra',
    'success': 'Pedido Confirmado',
    'admin': 'Administração',
    'customers': 'Clientes',
    'orders': 'Pedidos',
    'categories': 'Categorias',
    'inventory': 'Estoque',
    'reports': 'Relatórios',
    'settings': 'Configurações',
    'edit': 'Editar',
    'favorites': 'Favoritos',
    'manipulados': 'Manipulados',
    'cosmeticos': 'Cosméticos',
    'suplementos': 'Suplementos',
    'fitoterapicos': 'Fitoterápicos',
    'dermocosmeticos': 'Dermocosméticos'
  };

  let currentPath = '';
  
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Get label for segment
    let label = routeLabels[segment] || capitalizeFirst(segment);
    
    // Special handling for dynamic routes
    if (segment.length > 20 || segment.includes('-')) {
      // Likely a slug, format it nicely
      label = segment
        .split('-')
        .map(word => capitalizeFirst(word))
        .join(' ');
    }
    
    items.push({
      label,
      href: currentPath,
      isActive: index === paths.length - 1
    });
  });
  
  return items;
}

// Utility function to capitalize first letter
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Specific breadcrumb components for different pages
export function ProductBreadcrumbs({ 
  category, 
  productName 
}: { 
  category?: string; 
  productName?: string; 
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Produtos', href: '/products' }
  ];
  
  if (category) {
    items.push({
      label: category,
      href: `/category/${category.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  if (productName) {
    items.push({
      label: productName,
      href: '#',
      isActive: true
    });
  }
  
  return <Breadcrumbs items={items} />;
}

export function AdminBreadcrumbs({ 
  section, 
  subsection, 
  item 
}: { 
  section?: string; 
  subsection?: string; 
  item?: string; 
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Administração', href: '/admin' }
  ];
  
  if (section) {
    items.push({
      label: section,
      href: `/admin/${section.toLowerCase()}`
    });
  }
  
  if (subsection) {
    items.push({
      label: subsection,
      href: `/admin/${section?.toLowerCase()}/${subsection.toLowerCase()}`
    });
  }
  
  if (item) {
    items.push({
      label: item,
      href: '#',
      isActive: true
    });
  }
  
  return <Breadcrumbs items={items} />;
} 