"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Aqui você pode buscar detalhes do pedido usando payment_intent ou session_id
    const paymentIntent = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');
    
    // Simular dados do pedido
    setOrderDetails({
      id: 'ORD-' + Date.now(),
      total: 150.00,
      paymentMethod: paymentIntent ? 'Cartão de Crédito' : 'Stripe Checkout',
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-headline text-green-600">
            Pagamento Realizado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Obrigado pela sua compra! Seu pedido foi processado com sucesso.
          </p>
          
          {orderDetails && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Pedido:</span>
                <span className="font-medium">{orderDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pagamento:</span>
                <span className="font-medium">{orderDetails.paymentMethod}</span>
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Você receberá um email de confirmação em breve com os detalhes do seu pedido.
          </p>
          
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/orders" passHref>
              <Button className="w-full" variant="default">
                <Package className="mr-2 h-4 w-4" />
                Ver Meus Pedidos
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button className="w-full" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}