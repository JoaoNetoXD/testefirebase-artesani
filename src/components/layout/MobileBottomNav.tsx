
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/category/manipulados', label: 'Produtos', icon: LayoutGrid },
  { href: '/cart', label: 'Carrinho', icon: ShoppingCart, isCart: true },
  { href: '/account/favorites', label: 'Favoritos', icon: Heart, isFavorites: true },
  { href: '/account', label: 'Conta', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart(); // Acessar o carrinho para a contagem de itens
  const { favorites } = useFavorites();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItemsInCart = isMounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const favoriteCount = isMounted ? favorites.length : 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground shadow-t-lg border-t-2 border-secondary z-50 animate-fade-in-up" style={{animationDelay: '300ms'}}>
      <div className="flex justify-around items-center h-16">
        {navLinks.map((link) => {
          const isActive = (link.href === '/' && pathname === '/') || 
                           (link.href !== '/' && pathname.startsWith(link.href) && !(link.href === '/account' && pathname.startsWith('/account/favorites'))); // Evitar que "Conta" fique ativa quando em "Favoritos"

          if (link.href === '/account/favorites' && pathname.startsWith('/account') && pathname !== '/account/favorites') {
             // Não marcar favoritos como ativo se estiver em outra página da conta
          }


          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center text-center p-2 rounded-md transition-all hover:scale-105 w-1/5 relative group',
                isActive ? 'text-accent scale-110' : 'hover:text-secondary'
              )}
            >
              <div className="relative">
                <link.icon className={cn("h-6 w-6 mb-0.5", isActive ? "text-accent" : "text-primary-foreground/80 group-hover:text-secondary transition-colors")} />
                {link.isCart && isMounted && totalItemsInCart > 0 && (
                  <span className="absolute -top-1 -right-2.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {totalItemsInCart}
                  </span>
                )}
                {link.isFavorites && isMounted && favoriteCount > 0 && (
                   <span className="absolute -top-1 -right-2.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] leading-tight mt-0.5", isActive ? 'font-semibold text-accent' : 'text-primary-foreground/80 group-hover:text-secondary transition-colors')}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
