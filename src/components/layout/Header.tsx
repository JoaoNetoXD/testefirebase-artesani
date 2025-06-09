
"use client";
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, Phone, Mail, Info, Heart, LogOut } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockCategories } from '@/lib/data';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { currentUser, logout, loading: authLoading } = useAuth(); // Get currentUser and logout
  const [cartItemCount, setCartItemCount] = useState(0);
  const [favoriteItemCount, setFavoriteItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setCartItemCount(cart.reduce((count, item) => count + item.quantity, 0));
      setFavoriteItemCount(favorites.length);
    }
  }, [cart, favorites, isMounted]);

  const mainNavLinks = [
    { href: '/', label: 'Início' },
    ...mockCategories.map(cat => ({ href: `/category/${cat.slug}`, label: cat.name })),
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#contato', label: 'Contato' },
  ];

  const accountLinks = [
    { href: '/account', label: 'Minha Conta' },
    { href: '/admin', label: 'Admin Panel' }, // Example admin link
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-primary text-primary-foreground/90"> {/* Alterado de bg-primary/80 para bg-primary */}
        <div className="container mx-auto px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:+5511999999999" className="flex items-center gap-1 hover:text-primary-foreground">
              <Phone size={14} />
              (11) 9999-9999
            </a>
            <a href="mailto:contato@artesani.com.br" className="flex items-center gap-1 hover:text-primary-foreground">
              <Mail size={14} />
              contato@artesani.com.br
            </a>
          </div>
          <div className="flex items-center gap-1 mt-1 sm:mt-0">
            <Info size={14} />
            Frete grátis acima de R$ 99
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo width={70} height={70} priority />

          <nav className="hidden lg:flex items-center space-x-5 font-medium">
            {mainNavLinks.slice(0, 5).map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-secondary transition-colors pb-1 border-b-2 border-transparent hover:border-secondary">
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex-1 flex justify-end items-center space-x-3">
            <div className="relative w-full max-w-xs hidden md:block">
              <Input 
                type="search" 
                placeholder="Buscar produtos..." 
                className="bg-card text-card-foreground placeholder:text-card-foreground/60 rounded-full h-10 pl-10 pr-4 w-full" 
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-card-foreground/60" />
            </div>

            {!authLoading && (
              currentUser ? (
                <>
                  <Link href="/account" passHref className="hidden sm:flex items-center gap-1.5 hover:text-secondary transition-colors">
                    <User size={20} />
                    {currentUser.displayName || "Minha Conta"}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair" className="hidden sm:inline-flex hover:bg-primary-foreground/10">
                    <LogOut />
                  </Button>
                </>
              ) : (
                <Link href="/login" passHref className="hidden sm:flex items-center gap-1.5 hover:text-secondary transition-colors">
                  <User size={20} />
                  Entrar
                </Link>
              )
            )}


            <Link href="/account/favorites" passHref>
              <Button variant="ghost" size="icon" aria-label="Meus Favoritos" className="relative hover:bg-primary-foreground/10">
                <Heart />
                {isMounted && favoriteItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {favoriteItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" aria-label="Carrinho de Compras" className="relative hover:bg-primary-foreground/10">
                <ShoppingCart />
                {isMounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-card text-card-foreground p-0">
                <div className="p-4 border-b border-border">
                  <Logo width={60} height={60} />
                </div>
                <nav className="flex flex-col space-y-1 p-4">
                  {mainNavLinks.map((link) => (
                     <SheetClose asChild key={link.label}>
                        <Link href={link.href} className="text-base hover:text-primary transition-colors p-3 rounded-md hover:bg-muted">
                            {link.label}
                        </Link>
                    </SheetClose>
                  ))}
                  <hr className="my-2 border-border" />
                  {!authLoading && currentUser && (
                    <>
                      {accountLinks.map((link) => (
                        <SheetClose asChild key={link.label}>
                          <Link href={link.href} className="text-base hover:text-primary transition-colors p-3 rounded-md hover:bg-muted">
                              {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild>
                        <button onClick={handleLogout} className="text-base text-destructive flex items-center gap-2 hover:text-primary transition-colors p-3 rounded-md hover:bg-muted w-full text-left">
                            <LogOut size={20} /> Sair
                        </button>
                      </SheetClose>
                    </>
                  )}
                  {!authLoading && !currentUser && (
                     <SheetClose asChild>
                        <Link href="/login" className="text-base flex items-center gap-2 hover:text-primary transition-colors p-3 rounded-md hover:bg-muted">
                            <User size={20} />
                            Entrar / Cadastrar
                        </Link>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="md:hidden bg-primary px-4 pb-3">
            <div className="relative w-full">
              <Input 
                type="search" 
                placeholder="Buscar produtos..." 
                className="bg-card text-card-foreground placeholder:text-card-foreground/60 rounded-full h-10 pl-10 pr-4 w-full" 
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-card-foreground/60" />
            </div>
        </div>
      </div>
    </header>
  );
}
