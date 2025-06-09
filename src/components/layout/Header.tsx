
"use client";
import Link from 'next/link';
import { ShoppingCart, UserCircle, Search, Menu } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockCategories } from '@/lib/data';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from '@/hooks/useCart';
import { useEffect, useState } from 'react';


export function Header() {
  const { cart } = useCart();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setCartItemCount(cart.reduce((count, item) => count + item.quantity, 0));
    }
  }, [cart, isMounted]);


  const navLinks = [
    { href: '/', label: 'Home' },
    ...mockCategories.map(cat => ({ href: `/category/${cat.slug}`, label: cat.name })),
    { href: '/account', label: 'Minha Conta' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center space-x-6 font-medium">
          {navLinks.slice(0, -2).map((link) => ( // Exclude Account and Admin for main nav
            <Link key={link.label} href={link.href} className="text-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center relative">
            <Input type="search" placeholder="Buscar produtos..." className="pr-10" />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Carrinho de Compras" className="relative">
              <ShoppingCart />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/account" passHref>
            <Button variant="ghost" size="icon" aria-label="Minha Conta">
              <UserCircle />
            </Button>
          </Link>
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.label} href={link.href} className="text-lg text-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-muted">
                        {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
