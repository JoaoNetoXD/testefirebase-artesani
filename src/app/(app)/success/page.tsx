
'use client';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderDetailItem {
  name: string;
  quantity: number;
}

interface OrderDetails {
  id: string;
  total: number;
  paymentMethod: string;
  customerName?: string;
  items?: OrderDetailItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    // const sessionId = searchParams.get('session_id'); // sessionId is available if needed

    // Simular dados do pedido - em um app real, você buscaria isso do backend ou estado global
    // com base no payment_intent ou session_id
    setOrderDetails({
      id: 'ORD-' + Date.now().toString().slice(-6), // ID mais curto para exibição
      total: parseFloat(searchParams.get('amount') || '150.00'), // Tenta pegar o valor do query param, se existir
      paymentMethod: paymentIntent ? 'Cartão de Crédito' : 'Stripe Checkout',
      customerName: searchParams.get('customer_name') || 'Cliente Artesani', // Simula nome do cliente
      items: [ // Simula itens do pedido
        { name: 'Produto Exemplo A', quantity: 1 },
        { name: 'Produto Exemplo B', quantity: 2 },
      ]
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center shadow-xl animate-fade-in-up">
        <CardHeader className="pt-8">
          <div className="mx-auto mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-headline text-green-600">
            Pagamento Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <p className="text-card-foreground/70">
            Obrigado pela sua compra! Seu pedido foi processado e em breve você receberá uma confirmação por email.
          </p>
          
          {orderDetails && (
            <div className="bg-green-500/10 p-4 rounded-lg space-y-3 text-left border border-green-500/20">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Pedido:</span>
                <span className="text-sm font-semibold text-green-800">{orderDetails.id}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-sm text-green-700">Cliente:</span>
                <span className="text-sm font-semibold text-green-800">{orderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Total:</span>
                <span className="text-sm font-semibold text-green-800">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Pagamento:</span>
                <span className="text-sm font-semibold text-green-800">{orderDetails.paymentMethod}</span>
              </div>
              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="pt-1">
                  <span className="text-sm text-green-700 block mb-1">Itens:</span>
                  <ul className="list-none space-y-0.5 text-xs text-green-800/90">
                    {orderDetails.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name} (x{item.quantity})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <p className="text-xs text-card-foreground/70">
            Acompanhe o status do seu pedido na seção &quot;Meus Pedidos&quot; da sua conta.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/account/orders">
                <Package className="mr-2 h-4 w-4" />
                Ver Meus Pedidos
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:flex-1 border-primary text-primary hover:bg-primary/10" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
