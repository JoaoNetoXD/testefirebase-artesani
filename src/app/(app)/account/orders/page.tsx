
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/lib/services/orderService';
import type { Order } from '@/lib/types';
import Image from "next/legacy/image";
import Link from 'next/link';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userOrders = await OrderService.getOrdersByUserId(currentUser.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser, loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue';
      case 'shipped': return 'Enviado';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Histórico de Pedidos</h1>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <p className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">R$ {order.total.toFixed(2)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Itens do Pedido:</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        {item.products && ( // Changed from item.product to item.products to match OrderService structure
                          (<>
                            <Image
                              src={(item.products.images && item.products.images.length > 0) ? item.products.images[0] : 'https://placehold.co/60x60.png'}
                              alt={item.products.name}
                              width={60}
                              height={60}
                              className="rounded object-cover"
                              data-ai-hint="product thumbnail"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.products.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantidade: {item.quantity} | Preço: R$ {item.price.toFixed(2)}
                              </p>
                            </div>
                          </>)
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              Você ainda não fez nenhum pedido.
            </p>
            <Button asChild>
              <Link href="/products">Começar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
