
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingBag, Package, Users, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/lib/services/orderService';
import { ProductService } from '@/lib/services/productService';
import { CustomerService } from '@/lib/services/customerService';
import { InventoryService } from '@/lib/services/inventoryService';
import type { Order, Product } from '@/lib/types';
import Image from "next/image";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    newCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, products, customers, lowStock] = await Promise.all([
        OrderService.getAllOrders(),
        ProductService.getAllProducts(),
        CustomerService.getAllCustomers(),
        InventoryService.getLowStockProducts(10) // Umbral de 10 para estoque baixo
      ]);

      const validOrders = orders.filter(order => order.status.toLowerCase() !== 'cancelado' && order.status.toLowerCase() !== 'reembolsado');
      const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status.toLowerCase() === 'pendente').length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newCustomers = customers.filter(customer => {
        if (!customer.joined) return false;
        const joinedDate = new Date(customer.joined);
        return joinedDate.getMonth() === currentMonth && joinedDate.getFullYear() === currentYear;
      }).length;

      setStats({
        totalRevenue,
        pendingOrders,
        totalProducts: products.length,
        newCustomers
      });

      setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
          title: "Erro no Dashboard",
          description: "Não foi possível carregar os dados do painel de controle.",
          variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statsCards = [
    { title: "Receita Total", value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-300" },
    { title: "Pedidos Pendentes", value: stats.pendingOrders.toString(), icon: ShoppingBag, color: "text-yellow-300" },
    { title: "Produtos Ativos", value: stats.totalProducts.toString(), icon: Package, color: "text-blue-300" },
    { title: "Novos Clientes (Mês)", value: stats.newCustomers.toString(), icon: Users, color: "text-purple-300" },
  ];

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pendente') return 'text-yellow-400';
    if (s === 'entregue') return 'text-green-400';
    if (s === 'cancelado') return 'text-red-400';
    if (s === 'enviado') return 'text-blue-400';
    return 'text-primary-foreground/60';
  }

  const StatCardSkeleton = () => (
    <Card className="bg-primary-foreground/5 border-primary-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3 bg-primary-foreground/10" />
        <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 bg-primary-foreground/10" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-headline font-bold">Dashboard</h1>
        <p className="text-primary-foreground/70 mt-1">
            Uma visão geral do seu e-commerce.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-primary-foreground/5 border-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 hover:shadow-lg hover:bg-primary-foreground/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary-foreground/70">{stat.title}</CardTitle>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
            <Card className="bg-primary-foreground/5 border-primary-foreground/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Últimos Pedidos</CardTitle>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/70 hover:text-white">
                        <Link href="/admin/orders">
                            Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex items-center justify-between p-3">
                                  <div className="flex items-center gap-3">
                                      <Skeleton className="h-8 w-8 rounded-full bg-primary-foreground/10" />
                                      <div className="space-y-1">
                                          <Skeleton className="h-4 w-24 bg-primary-foreground/10" />
                                          <Skeleton className="h-3 w-32 bg-primary-foreground/10" />
                                      </div>
                                  </div>
                                  <div className="text-right space-y-1">
                                      <Skeleton className="h-4 w-20 bg-primary-foreground/10" />
                                      <Skeleton className="h-3 w-16 bg-primary-foreground/10" />
                                  </div>
                              </div>
                          ))}
                        </div>
                    ) : recentOrders.length > 0 ? (
                        <div className="divide-y divide-primary-foreground/10">
                            {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-primary-foreground/10 transition-colors">
                                <div>
                                <p className="font-semibold text-white">{order.customer_name || 'N/A'}</p>
                                <p className="text-sm text-primary-foreground/60 font-mono">#{order.id}</p>
                                </div>
                                <div className="text-right">
                                <p className="font-medium text-white">R$ {order.total.toFixed(2)}</p>
                                <p className={`text-sm font-semibold ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </p>
                                </div>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-primary-foreground/60">
                            <Info className="mx-auto h-8 w-8 mb-2"/>
                            <p>Nenhum pedido recente encontrado.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div>
            <Card className="bg-primary-foreground/5 border-primary-foreground/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Estoque Baixo</CardTitle>
                     <Button variant="ghost" size="sm" asChild className="text-primary-foreground/70 hover:text-white">
                        <Link href="/admin/inventory">
                            Ver tudo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     {loading ? (
                         <div className="space-y-4">
                           {Array.from({ length: 3 }).map((_, i) => (
                               <div key={i} className="flex items-center space-x-3 p-2">
                                   <Skeleton className="h-10 w-10 rounded-md bg-primary-foreground/10" />
                                   <div className="flex-1 space-y-1">
                                       <Skeleton className="h-4 w-3/4 bg-primary-foreground/10" />
                                       <Skeleton className="h-3 w-1/4 bg-primary-foreground/10" />
                                   </div>
                               </div>
                           ))}
                         </div>
                    ) : lowStockProducts.length > 0 ? (
                        <div className="divide-y divide-primary-foreground/10">
                            {lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center space-x-3 p-3 hover:bg-primary-foreground/10 transition-colors">
                                <Image
                                src={(product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/48x48.png'}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-md object-cover border border-primary-foreground/20"
                                />
                                <div className="flex-1">
                                <p className="font-semibold text-sm text-white truncate">{product.name}</p>
                                <p className="text-xs text-yellow-400 font-bold">Restam: {product.stock}</p>
                                </div>
                                 <Button variant="outline" size="sm" asChild className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
                                    <Link href={`/admin/products/edit/${product.slug}`}>
                                        Editar
                                    </Link>
                                </Button>
                            </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-8 text-primary-foreground/60">
                            <Info className="mx-auto h-8 w-8 mb-2"/>
                            <p>Nenhum produto com estoque baixo.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
