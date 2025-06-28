
'use client';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OrderService } from '@/lib/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import type { Order } from '@/lib/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = searchParams.get('order');
      
      if (orderId) {
        setLoading(true);
        try {
          const order = await OrderService.getOrderById(orderId);
          if (order && order.user_id === currentUser?.id) {
            setOrderDetails(order);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do pedido:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrderDetails();
    }
  }, [searchParams, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

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
          
          {orderDetails ? (
            <div className="bg-green-500/10 p-4 rounded-lg space-y-3 text-left border border-green-500/20">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Pedido:</span>
                <span className="text-sm font-semibold text-green-800">#{orderDetails.id.slice(0, 8)}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-sm text-green-700">Cliente:</span>
                <span className="text-sm font-semibold text-green-800">{orderDetails.customer_name || 'Cliente Artesani'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Total:</span>
                <span className="text-sm font-semibold text-green-800">R$ {orderDetails.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Pagamento:</span>
                <span className="text-sm font-semibold text-green-800">{orderDetails.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'Stripe Checkout'}</span>
              </div>
              {orderDetails.order_items && orderDetails.order_items.length > 0 && (
                <div className="pt-1">
                  <span className="text-sm text-green-700 block mb-1">Itens:</span>
                  <ul className="list-none space-y-0.5 text-xs text-green-800/90">
                    {orderDetails.order_items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.product?.name || 'Produto'} (x{item.quantity})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-500/10 p-4 rounded-lg text-center border border-green-500/20">
              <p className="text-sm text-green-700">Pedido processado com sucesso!</p>
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
