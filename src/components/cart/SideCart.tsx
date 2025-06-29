
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import SafeImage from "@/components/shared/SafeImage";
import Link from 'next/link';
import { Trash2, PlusCircle, MinusCircle, ShoppingBag } from 'lucide-react';

interface SideCartProps {
  closeSheet: () => void;
}

export default function SideCart({ closeSheet }: SideCartProps) {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="text-xl font-headline text-card-foreground">
          Seu Carrinho ({totalItems})
        </SheetTitle>
      </SheetHeader>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-card-foreground mb-2">Seu carrinho está vazio</p>
          <p className="text-sm text-muted-foreground mb-6">Adicione produtos para vê-los aqui.</p>
          <SheetClose asChild>
            <Button onClick={closeSheet} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Continuar Comprando
            </Button>
          </SheetClose>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card shadow-sm">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
                    <SafeImage
                      src={(item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/80x80.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      fallbackSrc="https://placehold.co/80x80.png"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link href={`/products/${item.slug}`} passHref>
                      <span onClick={closeSheet} className="text-sm font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </span>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full">
                     <p className="text-sm font-semibold text-primary">
                       R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                     </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <SheetFooter className="p-4 border-t mt-auto">
            <div className="w-full space-y-3">
              <div className="flex justify-between text-lg font-semibold text-card-foreground">
                <span>Subtotal:</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <SheetClose asChild>
                <Link href="/cart" passHref className="w-full">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                    Ver Carrinho Completo
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/checkout" passHref className="w-full">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Finalizar Compra
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </SheetFooter>
        </>
      )}
    </>
  );
}
