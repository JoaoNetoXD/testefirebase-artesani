
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { CreditCard, Lock, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-headline mb-4">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">Adicione produtos ao carrinho antes de prosseguir para o checkout.</p>
        <Link href="/" passHref>
          <Button size="lg" className="bg-primary text-primary-foreground">Continuar Comprando</Button>
        </Link>
      </div>
    );
  }
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission, e.g., send data to Stripe
    alert("Processamento de pagamento (simulado).");
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-headline mb-8 text-center">Finalizar Compra</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Order Summary */}
        <Card className="lg:col-span-1 p-6 shadow-lg sticky top-24 order-last lg:order-first">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Package className="mr-3 h-6 w-6 text-primary" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Image src={item.images[0]} alt={item.name} width={40} height={40} className="rounded" data-ai-hint="product icon" />
                  <span>{item.name} (x{item.quantity})</span>
                </div>
                <span>R$ {(item.price * item.quantity).toFixed(2).replace('.',',')}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>R$ {totalPrice.toFixed(2).replace('.',',')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frete</span>
              <span>Grátis</span> {/* Placeholder */}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-xl text-primary">
              <span>Total</span>
              <span>R$ {totalPrice.toFixed(2).replace('.',',')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Informações de Contato e Entrega</CardTitle>
              <CardDescription>Precisamos dessas informações para processar seu pedido.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Seu nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Rua, Número, Complemento" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Sua cidade" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="Seu estado" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <Input id="zip" placeholder="XXXXX-XXX" required />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <CreditCard className="mr-3 h-6 w-6 text-primary" />
                Pagamento
              </CardTitle>
              <CardDescription>Escolha sua forma de pagamento. Transação segura via Stripe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder for Stripe Elements */}
              <div className="p-6 border border-dashed rounded-md text-center text-muted-foreground">
                <Lock className="mx-auto h-8 w-8 mb-2" />
                Integração com Stripe para Cartão de Crédito/Débito e PIX aparecerá aqui.
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Pagar R$ {totalPrice.toFixed(2).replace('.',',')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
