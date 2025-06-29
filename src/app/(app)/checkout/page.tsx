
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Lock, Package, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { OrderService } from '@/lib/services/orderService';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'checkout'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Verificar se o usuário está logado
  if (!loading && !currentUser) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-headline mb-4">Login Necessário</h1>
        <p className="text-muted-foreground mb-8">Você precisa estar logado para finalizar a compra.</p>
        <Link href="/login?redirect=/checkout" passHref>
          <Button size="lg" className="bg-primary text-primary-foreground">Fazer Login</Button>
        </Link>
      </div>
    );
  }

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

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const createOrder = async (paymentIntentId?: string, stripeSessionId?: string) => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para finalizar a compra",
        variant: "destructive"
      });
      router.push('/login');
      return null;
    }

    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const shippingAddress = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zip: customerInfo.zip
      };

      const order = await OrderService.createOrder({
        user_id: currentUser.id,
        total: totalPrice,
        status: 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod === 'card' ? 'credit_card' : 'stripe_checkout',
        payment_status: 'pending',
        payment_intent_id: paymentIntentId,
        stripe_session_id: stripeSessionId,
        order_items: orderItems
      });

      if (order) {
        return order;
      } else {
        throw new Error('Falha ao criar pedido');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    // Criar pedido no banco de dados
    const order = await createOrder(paymentIntentId);
    
    if (order) {
      // Atualizar status do pedido para pago
      await OrderService.updateOrderStatus(order.id, 'processing');
      
      // Limpar carrinho
      clearCart();
      
      // Redirecionar para página de sucesso com ID do pedido
      router.push(`/success?order=${order.id}`);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Primeiro criar o pedido
      const order = await createOrder();
      
      if (!order) {
        setError('Erro ao criar pedido');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          successUrl: `${window.location.origin}/success?order=${order.id}`,
          cancelUrl: `${window.location.origin}/checkout`,
          metadata: {
            orderId: order.id,
            userId: currentUser?.id
          }
        }),
      });

      const data = await response.json();
      
      if (data.url && data.sessionId) {
        // Atualizar o pedido com o sessionId
        await OrderService.updateOrder(order.id, { stripe_session_id: data.sessionId });
        window.location.href = data.url;
      } else {
        setError('Erro ao criar sessão de checkout');
        // Cancelar o pedido se falhar
        await OrderService.updateOrderStatus(order.id, 'cancelled');
      }
    } catch {
      setError('Erro ao processar checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = Object.values(customerInfo).every(value => value.trim() !== '');

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
                  <Image 
                    src={(item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/40x40.png'} 
                    alt={item.name} 
                    width={40} 
                    height={40} 
                    className="rounded" 
                  />
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
              <span>Grátis</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-xl text-primary">
              <span>Total</span>
              <span>R$ {totalPrice.toFixed(2).replace('.',',')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Informações de Contato e Entrega</CardTitle>
              <CardDescription>Precisamos dessas informações para processar seu pedido.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  placeholder="Seu nome completo" 
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="(XX) XXXXX-XXXX" 
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  placeholder="Rua, Número, Complemento" 
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input 
                  id="city" 
                  placeholder="Sua cidade" 
                  value={customerInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  placeholder="Seu estado" 
                  value={customerInfo.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <Input 
                  id="zip" 
                  placeholder="XXXXX-XXX" 
                  value={customerInfo.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Método de Pagamento</CardTitle>
              <CardDescription>Escolha como deseja pagar seu pedido.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: 'card' | 'checkout') => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Cartão de Crédito/Débito (Formulário Integrado)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="checkout" id="checkout" />
                  <Label htmlFor="checkout" className="flex items-center cursor-pointer">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Stripe Checkout (PIX + Cartão)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentMethod === 'card' && isFormValid && (
            <StripePaymentForm
              amount={totalPrice}
              onSuccess={(paymentIntentId) => handlePaymentSuccess(paymentIntentId)}
              onError={handlePaymentError}
              customerInfo={customerInfo}
            />
          )}

          {paymentMethod === 'checkout' && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Checkout Seguro
                </CardTitle>
                <CardDescription>
                  Você será redirecionado para o Stripe Checkout para finalizar o pagamento.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={handleStripeCheckout}
                  disabled={!isFormValid || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? 'Processando...' : `Ir para Checkout - R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
                </Button>
              </CardFooter>
            </Card>
          )}

          {!isFormValid && (
            <Alert>
              <AlertDescription>
                Preencha todas as informações de contato e entrega para continuar.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
