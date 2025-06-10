
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from 'react';
import { OrderService } from '@/lib/services/orderService';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/lib/types';

export default function AccountOverviewPage() {
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentOrder = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const orders = await OrderService.getOrdersByUserId(user.id);
        if (orders.length > 0) {
          setRecentOrder(orders[0]); // Pega o pedido mais recente
        }
      } catch (error) {
        console.error('Erro ao carregar pedido recente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrder();
  }, [user]);

  const userProfile = {
    name: user?.name || "Usuário",
    email: user?.email || "usuario@exemplo.com"
  };

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Visão Geral da Conta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Último Pedido</CardTitle>
          </CardHeader>
          {loading ? (
            <CardContent>
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          ) : recentOrder ? (
            <>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pedido #{recentOrder.id} - Data: {new Date(recentOrder.created_at).toLocaleDateString('pt-BR')}
                </p>
                {recentOrder.order_items && recentOrder.order_items.length > 0 && (
                  <ul className="space-y-2">
                    {recentOrder.order_items.slice(0, 2).map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <Image 
                          src={item.products?.imageUrl || 'https://placehold.co/40x40.png'} 
                          alt={item.products?.name || 'Produto'} 
                          width={40} 
                          height={40} 
                          className="rounded-md object-cover border border-border"
                        />
                        <span className="text-card-foreground">
                          {item.products?.name || 'Produto'} (x{item.quantity})
                        </span>
                      </li>
                    ))}
                    {recentOrder.order_items.length > 2 && (
                      <li className="text-sm text-muted-foreground">
                        +{recentOrder.order_items.length - 2} outros itens
                      </li>
                    )}
                  </ul>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-lg font-bold">R$ {recentOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm font-medium text-primary">{recentOrder.status}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/account/orders" className="w-full">
                  <Button variant="outline" className="w-full">
                    Ver Todos os Pedidos
                  </Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardContent>
                <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
              </CardContent>
              <CardFooter>
                <Link href="/" className="w-full">
                  <Button className="w-full">
                    Começar a Comprar
                  </Button>
                </Link>
              </CardFooter>
            </>
          )}
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base">{userProfile.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{userProfile.email}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/account/profile" className="w-full">
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
