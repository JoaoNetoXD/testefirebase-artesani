
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-headline mb-4">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">Parece que você ainda não adicionou nenhum produto.</p>
        <Link href="/" passHref>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Continuar Comprando</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-headline mb-8">Seu Carrinho de Compras</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-sm">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden shrink-0">
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" data-ai-hint="product thumbnail" />
              </div>
              <div className="flex-grow">
                <Link href={`/products/${item.slug}`} passHref>
                  <h2 className="text-lg font-semibold hover:text-primary transition-colors">{item.name}</h2>
                </Link>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-md font-semibold text-primary mt-1">R$ {item.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                  <MinusCircle className="h-5 w-5" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-16 h-10 text-center"
                  min="1"
                />
                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="shrink-0">
                <p className="text-md font-semibold">Subtotal: R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 shrink-0">
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-1 p-6 shadow-lg h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <p>Total de Itens:</p>
              <p>{totalItems}</p>
            </div>
            <div className="flex justify-between font-semibold text-xl">
              <p>Total:</p>
              <p>R$ {totalPrice.toFixed(2).replace('.', ',')}</p>
            </div>
            <p className="text-xs text-muted-foreground">Taxas e frete serão calculados no checkout.</p>
          </CardContent>
          <CardFooter>
            <Link href="/checkout" passHref className="w-full">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Finalizar Compra
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
